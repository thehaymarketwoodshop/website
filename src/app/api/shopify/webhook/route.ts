import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyShopifyWebhookHmac } from '@/lib/shopify';
import { sendPaymentReceipt, sendDepositReceipt } from '@/lib/invoiceEmail';
import { computeDepositSplit } from '@/lib/invoiceMath';
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

  // We stamp the draft order's note as "Invoice INV-YYYY-NNNNN" (plus "— Deposit" or
  // "— Balance" for a split payment) at creation time (see src/lib/shopify.ts) —
  // Shopify carries that note over onto the resulting Order once the draft order is
  // completed, so we use it to find our invoice and which stage this payment is.
  const noteMatch = typeof order.note === 'string' ? order.note.match(/Invoice (\S+)/) : null;
  if (!noteMatch) {
    // Not one of our invoice-derived orders — ignore.
    return NextResponse.json({ ok: true });
  }
  const invoiceNo = noteMatch[1];
  const isDepositStage = typeof order.note === 'string' && order.note.includes('— Deposit');

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

  if (isDepositStage) {
    if (inv.deposit_paid_at) {
      return NextResponse.json({ ok: true }); // already processed — webhook retry
    }
    const now = new Date().toISOString();
    await supabaseAdmin
      .from('invoices')
      .update({ status: 'deposit_paid', deposit_paid_at: now })
      .eq('id', inv.id);

    try {
      const { depositCents, balanceCents } = computeDepositSplit(inv.total_cents, inv.deposit_percent!);
      await sendDepositReceipt(inv, depositCents, balanceCents);
    } catch (err) {
      console.error('Failed to send deposit receipt emails:', err);
    }
    return NextResponse.json({ ok: true });
  }

  if (inv.status === 'paid') {
    return NextResponse.json({ ok: true }); // already processed — webhook retry
  }

  const now = new Date().toISOString();
  const updates: Partial<DbInvoice> = { status: 'paid', paid_at: now };
  if (inv.deposit_percent != null) updates.balance_paid_at = now;
  await supabaseAdmin.from('invoices').update(updates).eq('id', inv.id);

  try {
    const amountPaidCents =
      inv.deposit_percent != null
        ? computeDepositSplit(inv.total_cents, inv.deposit_percent).balanceCents
        : inv.total_cents;
    await sendPaymentReceipt(inv, amountPaidCents);
  } catch (err) {
    console.error('Failed to send payment receipt emails:', err);
  }

  return NextResponse.json({ ok: true });
}
