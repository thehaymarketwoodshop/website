import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { DbInvoice, DbInvoiceGroupWithOptions } from '@/types/invoice';

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const body = await request.json();
  const invoiceId: string | undefined = body?.invoiceId;
  if (!invoiceId) {
    return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('invoice_groups')
    .select('*, invoices(*)')
    .eq('public_token', params.token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const group = data as DbInvoiceGroupWithOptions;

  if (group.status === 'void') {
    return NextResponse.json({ error: 'This options link is no longer active' }, { status: 409 });
  }
  if (group.status === 'selected') {
    const already = (group.invoices as DbInvoice[]).find((inv) => inv.id === group.selected_invoice_id);
    return NextResponse.json({ success: true, selectedToken: already?.public_token ?? null });
  }

  const chosen = (group.invoices as DbInvoice[]).find((inv) => inv.id === invoiceId);
  if (!chosen) {
    return NextResponse.json({ error: 'That option is not part of this group' }, { status: 400 });
  }

  const otherIds = (group.invoices as DbInvoice[])
    .filter((inv) => inv.id !== invoiceId)
    .map((inv) => inv.id);

  if (otherIds.length > 0) {
    await supabaseAdmin.from('invoices').update({ status: 'void' }).in('id', otherIds);
  }

  await supabaseAdmin
    .from('invoice_groups')
    .update({ status: 'selected', selected_invoice_id: invoiceId })
    .eq('id', group.id);

  return NextResponse.json({ success: true, selectedToken: chosen.public_token });
}
