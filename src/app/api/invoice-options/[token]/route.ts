import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { DbInvoiceGroupWithOptions } from '@/types/invoice';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { data, error } = await supabaseAdmin
    .from('invoice_groups')
    .select('*, invoices(*, invoice_items(*))')
    .eq('public_token', params.token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const group = data as DbInvoiceGroupWithOptions;

  if (!group.viewed_at) {
    await supabaseAdmin.from('invoice_groups').update({ viewed_at: new Date().toISOString() }).eq('id', group.id);
    group.viewed_at = new Date().toISOString();
  }

  let selectedToken: string | null = null;
  if (group.status === 'selected' && group.selected_invoice_id) {
    const selected = group.invoices.find((inv) => inv.id === group.selected_invoice_id);
    selectedToken = selected?.public_token ?? null;
  }

  return NextResponse.json({ group, selectedToken });
}
