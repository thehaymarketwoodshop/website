import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendInvoiceOptionsLink } from '@/lib/invoiceEmail';
import type { DbInvoice } from '@/types/invoice';

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const invoiceIds: string[] = Array.isArray(body?.invoiceIds) ? body.invoiceIds : [];
  if (invoiceIds.length < 2) {
    return NextResponse.json({ error: 'Select at least two invoices to send as options' }, { status: 400 });
  }

  const { data: invoices, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .in('id', invoiceIds);

  if (error || !invoices || invoices.length !== invoiceIds.length) {
    return NextResponse.json({ error: 'One or more invoices could not be found' }, { status: 404 });
  }

  const rows = invoices as DbInvoice[];
  const buyerEmail = rows[0].buyer_email;
  if (!buyerEmail || rows.some((inv) => inv.buyer_email !== buyerEmail)) {
    return NextResponse.json({ error: 'All selected invoices must have the same buyer email' }, { status: 400 });
  }
  if (rows.some((inv) => inv.group_id)) {
    return NextResponse.json({ error: 'One or more of these invoices is already part of a group' }, { status: 400 });
  }
  if (rows.some((inv) => inv.status !== 'draft')) {
    return NextResponse.json({ error: 'Only draft invoices can be grouped and sent as options' }, { status: 400 });
  }

  const { data: group, error: groupError } = await supabaseAdmin
    .from('invoice_groups')
    .insert({})
    .select()
    .single();
  if (groupError || !group) {
    return NextResponse.json({ error: 'Failed to create invoice group' }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { error: linkError } = await supabaseAdmin
    .from('invoices')
    .update({ group_id: group.id, status: 'sent', sent_at: now })
    .in('id', invoiceIds);
  if (linkError) {
    return NextResponse.json({ error: 'Failed to link invoices to the group' }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const optionsLink = `${siteUrl}/invoice-options/${group.public_token}`;

  try {
    await sendInvoiceOptionsLink(buyerEmail, rows.map((inv) => ({ ...inv, status: 'sent' as const, sent_at: now })), optionsLink);
  } catch (err) {
    console.error('Failed to send invoice options email:', err);
    return NextResponse.json({ error: 'Invoices were grouped but the email failed to send.' }, { status: 500 });
  }

  await supabaseAdmin.from('invoice_groups').update({ sent_at: now }).eq('id', group.id);

  return NextResponse.json({ success: true, optionsLink });
}
