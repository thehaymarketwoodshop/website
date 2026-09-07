import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyShopifyWebhookHmac } from '@/lib/shopify';
import { sendPaymentReceipt } from '@/lib/invoiceEmail';
import type { DbInvoice } from '@/types/invoice';

// Shopify webhook for the "orders/paid" topic. Register this in Shopify Admin
// (or via the Admin API) pointing at https://yourdomain.com/api/shopify/webhook
// once deployed — webhooks need a real public HTTPS URL, not localhost.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256');

  if (!verifyShopifyWebhookHmac(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const order = JSON.parse(rawBody);

  // We stamp the draft order's note as "Invoice INV-YYYY-NNNNN" at creation time
  // (see src/lib/shopify.ts) — Shopify carries that note over onto the resulting
  // Order once the draft order is completed, so we use it to find our invoice.
  const noteMatch = typeof order.note === 'string' ? order.note.match(/Invoice (\S+)/) : null;
  if (!noteMatch) {
    // Not one of our invoice-derived orders — ignore.
    return NextResponse.json({ ok: true });
  }
  const invoiceNo = noteMatch[1];

  const { data: invoice, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('invoice_no', invoiceNo)
    .single();

  if (error || !invoice) {
    console.error(`Shopify webhook: no invoice found for ${invoiceNo}`);
    return NextResponse.json({ ok: true });
  }

  const inv = invoice as DbInvoice;
  if (inv.status === 'paid') {
    return NextResponse.json({ ok: true }); // already processed — webhook retry
  }

  await supabaseAdmin
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', inv.id);

  try {
    await sendPaymentReceipt(inv);
  } catch (err) {
    console.error('Failed to send payment receipt emails:', err);
  }

  return NextResponse.json({ ok: true });
}
