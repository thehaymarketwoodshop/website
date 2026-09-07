import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { DbInvoiceWithItems } from '@/types/invoice';

// Public route — a customer is authenticated by possessing this unguessable token,
// not by a Supabase session, so this deliberately runs with the service-role client
// rather than relying on RLS (which is admin_allowlist-based and has no anon policy here).
export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  const { data: invoice, error } = await supabaseAdmin
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('public_token', params.token)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const inv = invoice as DbInvoiceWithItems;

  if (inv.status === 'sent') {
    await supabaseAdmin
      .from('invoices')
      .update({ status: 'viewed', viewed_at: new Date().toISOString() })
      .eq('id', inv.id);
    inv.status = 'viewed';
  }

  return NextResponse.json({ invoice: inv });
}
