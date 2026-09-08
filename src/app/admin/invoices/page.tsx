'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import { checkIsAdmin, fetchInvoices, deleteInvoice } from '@/lib/supabaseClient';
import { fmtCents } from '@/lib/invoiceMath';
import type { DbInvoice, InvoiceStatus } from '@/types/invoice';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-600',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-amber-100 text-amber-700',
  signed: 'bg-purple-100 text-purple-700',
  paid: 'bg-green-100 text-green-700',
  void: 'bg-red-100 text-red-700',
};

export default function AdminInvoicesPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<DbInvoice[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
      if (admin) setInvoices(await fetchInvoices());
      setIsLoading(false);
    })();
  }, []);

  function copyLink(inv: DbInvoice) {
    const url = `${window.location.origin}/invoice/${inv.public_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function handleDelete(inv: DbInvoice) {
    const label = inv.buyer_company || inv.buyer_email || inv.invoice_no;
    if (!confirm(`Delete invoice ${inv.invoice_no} (${label})? This can't be undone.`)) return;
    try {
      await deleteInvoice(inv.id);
      setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-oak)' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 pb-20 container-narrow text-center">
        <h1 className="heading-section mb-4">Access Denied</h1>
        <Link href="/admin" className="link-subtle">Go to login →</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 sm:pt-40 pb-20 container-wide">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 link-subtle">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="heading-section">Invoices</h1>
        </div>
        <Link href="/admin/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--color-ivory-dark)', borderBottom: '1px solid var(--color-stone)' }}>
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold">Invoice #</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Buyer</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Total</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Status</th>
              <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--color-stone)' }}>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center body-regular">
                  No invoices yet. Click &quot;New Invoice&quot; to create one.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 font-medium">{inv.invoice_no}</td>
                  <td className="px-6 py-4 body-regular">{inv.buyer_company || inv.buyer_email || '—'}</td>
                  <td className="px-6 py-4 body-regular">{fmtCents(inv.total_cents)}</td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize', STATUS_STYLES[inv.status])}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => copyLink(inv)} className="p-2 link-subtle" title="Copy customer link">
                        {copiedId === inv.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <Link href={`/admin/invoices/${inv.id}`} className="link-subtle text-sm font-medium">
                        Open →
                      </Link>
                      <button onClick={() => handleDelete(inv)} className="p-2 text-red-500 hover:text-red-700" title="Delete invoice">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
