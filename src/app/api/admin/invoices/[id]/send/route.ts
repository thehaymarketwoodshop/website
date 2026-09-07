import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendInvoiceLink } from '@/lib/invoiceEmail';
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
  if (!inv.buyer_email) {
    return NextResponse.json({ error: 'This invoice has no buyer email to send to' }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const invoiceLink = `${siteUrl}/invoice/${inv.public_token}`;

  try {
    await sendInvoiceLink(inv, invoiceLink);
  } catch (err) {
    console.error('Failed to send invoice email:', err);
    return NextResponse.json({ error: 'Failed to send email. Check SMTP configuration.' }, { status: 500 });
  }

  const updates: Partial<DbInvoice> = {};
  if (inv.status === 'draft') updates.status = 'sent';
  if (!inv.sent_at) updates.sent_at = new Date().toISOString();

  if (Object.keys(updates).length > 0) {
    await supabaseAdmin.from('invoices').update(updates).eq('id', inv.id);
  }

  return NextResponse.json({ success: true, invoiceLink });
}
