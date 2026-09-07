import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { signInvoiceSchema } from '@/lib/validation';
import { createDraftOrderForInvoice } from '@/lib/shopify';
import { sendSignedConfirmation } from '@/lib/invoiceEmail';
import type { DbInvoiceItem, DbInvoiceWithItems } from '@/types/invoice';

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const body = await request.json();
  const result = signInvoiceSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors.map((e) => e.message).join(', ') }, { status: 400 });
  }
  const { signerName, signerEmail } = result.data;

  const { data: invoice, error } = await supabaseAdmin
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('public_token', params.token)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const inv = invoice as DbInvoiceWithItems;

  if (inv.status === 'signed' || inv.status === 'paid') {
    return NextResponse.json({ error: 'This invoice has already been signed' }, { status: 409 });
  }
  if (inv.status === 'void') {
    return NextResponse.json({ error: 'This invoice is no longer active' }, { status: 409 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const { error: sigError } = await supabaseAdmin.from('invoice_signatures').insert({
    invoice_id: inv.id,
    signer_name: signerName,
    signer_email: signerEmail || inv.buyer_email || null,
    agreement_text: inv.legal_text,
    ip_address: ip,
    user_agent: userAgent,
  });
  if (sigError) {
    console.error('Failed to record signature:', sigError);
    return NextResponse.json({ error: 'Failed to record signature' }, { status: 500 });
  }

  const updates: Record<string, unknown> = {
    status: 'signed',
    signed_at: new Date().toISOString(),
  };

  // Best-effort: create the Shopify draft order so "Pay Now" works immediately.
  // Signing succeeds even if Shopify isn't configured yet — the admin can send the
  // pay link later once SHOPIFY_* env vars are set.
  try {
    const items = inv.invoice_items as DbInvoiceItem[];
    const { draftOrderId, invoiceUrl } = await createDraftOrderForInvoice(inv, items);
    updates.shopify_draft_order_id = draftOrderId;
    updates.shopify_invoice_url = invoiceUrl;
  } catch (err) {
    console.error('Shopify draft order creation failed:', err);
  }

  await supabaseAdmin.from('invoices').update(updates).eq('id', inv.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const invoiceLink = `${siteUrl}/invoice/${inv.public_token}`;

  try {
    await sendSignedConfirmation({ ...inv, ...updates } as typeof inv, invoiceLink, signerName);
  } catch (err) {
    console.error('Failed to send signed-confirmation emails:', err);
  }

  return NextResponse.json({
    success: true,
    shopifyInvoiceUrl: updates.shopify_invoice_url ?? null,
  });
}
