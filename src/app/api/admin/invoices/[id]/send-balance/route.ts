import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createDraftOrderForAmount } from '@/lib/shopify';
import { computeDepositSplit } from '@/lib/invoiceMath';
import { sendBalanceDueLink } from '@/lib/invoiceEmail';
import type { DbInvoice } from '@/types/invoice';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: invoice, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const inv = invoice as DbInvoice;
  if (inv.deposit_percent == null) {
    return NextResponse.json({ error: 'This invoice is not split into a deposit and balance' }, { status: 400 });
  }
  if (inv.status !== 'deposit_paid') {
    return NextResponse.json({ error: 'The deposit has not been paid yet' }, { status: 400 });
  }
  if (!inv.buyer_email) {
    return NextResponse.json({ error: 'This invoice has no buyer email to send to' }, { status: 400 });
  }

  const { balanceCents } = computeDepositSplit(inv.total_cents, inv.deposit_percent);

  let balanceUrl = inv.balance_shopify_invoice_url;
  let balanceOrderId = inv.balance_shopify_draft_order_id;

  if (!balanceUrl) {
    try {
      const { draftOrderId, invoiceUrl } = await createDraftOrderForAmount(inv, {
        title: `Balance (${100 - inv.deposit_percent}%) — Invoice ${inv.invoice_no}`,
        amountCents: balanceCents,
        noteStage: 'Balance',
      });
      balanceUrl = invoiceUrl;
      balanceOrderId = draftOrderId;
    } catch (err) {
      console.error('Failed to create balance draft order:', err);
      return NextResponse.json({ error: 'Failed to create the balance payment link via Shopify' }, { status: 500 });
    }
  }

  try {
    await sendBalanceDueLink(inv, balanceCents, balanceUrl);
  } catch (err) {
    console.error('Failed to send balance due email:', err);
    return NextResponse.json({ error: 'Failed to send the balance due email' }, { status: 500 });
  }

  await supabaseAdmin
    .from('invoices')
    .update({
      balance_shopify_draft_order_id: balanceOrderId,
      balance_shopify_invoice_url: balanceUrl,
      balance_sent_at: new Date().toISOString(),
    })
    .eq('id', inv.id);

  return NextResponse.json({ success: true, balanceLink: balanceUrl });
}
