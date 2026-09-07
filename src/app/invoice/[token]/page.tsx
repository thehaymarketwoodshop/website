'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { InvoicePreview } from '@/components/InvoicePreview';
import { Button } from '@/components/Button';
import { fmtCents } from '@/lib/invoiceMath';
import type { DbInvoiceWithItems } from '@/types/invoice';

export default function CustomerInvoicePage({ params }: { params: { token: string } }) {
  const [invoice, setInvoice] = useState<DbInvoiceWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [payLink, setPayLink] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/invoice/${params.token}`);
        if (!res.ok) { setNotFound(true); setIsLoading(false); return; }
        const json = await res.json();
        setInvoice(json.invoice);
        setSignerEmail(json.invoice.buyer_email || '');
        setPayLink(json.invoice.shopify_invoice_url || null);
      } catch {
        setNotFound(true);
      }
      setIsLoading(false);
    })();
  }, [params.token]);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/invoice/${params.token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName, signerEmail, reviewed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to sign');
      setInvoice({ ...invoice, status: 'signed' });
      setPayLink(json.shopifyInvoiceUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign invoice');
    }
    setSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-oak)' }} />
      </div>
    );
  }

  if (notFound || !invoice) {
    return (
      <div className="min-h-screen pt-32 pb-20 container-narrow text-center">
        <h1 className="heading-section mb-4">Invoice Not Found</h1>
        <p className="body-regular">This invoice link is invalid or has been removed.</p>
      </div>
    );
  }

  const isSigned = invoice.status === 'signed' || invoice.status === 'paid';
  const isPaid = invoice.status === 'paid';
  const isVoid = invoice.status === 'void';

  return (
    <div className="min-h-screen pt-16 pb-20" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
      <div className="container-narrow pt-16">
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 40px rgba(0,0,0,.08)', overflow: 'hidden' }}>
          <InvoicePreview
            invoiceNo={invoice.invoice_no}
            issueDate={invoice.issue_date}
            dueDate={invoice.due_date}
            terms={invoice.terms}
            buyer={{
              company: invoice.buyer_company || '',
              contact: invoice.buyer_contact || '',
              address: invoice.buyer_address || '',
              city: invoice.buyer_city || '',
              email: invoice.buyer_email || '',
            }}
            items={invoice.invoice_items.map((it) => ({ description: it.description, unit: it.unit || '', qty: it.qty, rate: it.rate_cents / 100 }))}
            taxRate={invoice.tax_rate}
            shipping={invoice.shipping_cents / 100}
            discountType={invoice.discount_type}
            discountValue={invoice.discount_value}
            notes={invoice.notes || ''}
            paymentMethods={invoice.payment_methods}
            projectDescription={invoice.project_description || ''}
            renderImageUrl={invoice.render_image_url}
          />
        </div>

        <div className="card p-8 mt-6">
          {isVoid ? (
            <p className="body-regular text-center">This invoice is no longer active. Please contact us if you have questions.</p>
          ) : isPaid ? (
            <div className="text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-600" />
              <h2 className="heading-card mb-1">Paid</h2>
              <p className="body-regular">Thank you — this invoice has been paid in full.</p>
            </div>
          ) : isSigned ? (
            <div className="text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-walnut)' }} />
              <h2 className="heading-card mb-1">Signed</h2>
              <p className="body-regular mb-6">Thank you for reviewing and signing this invoice.</p>
              {payLink ? (
                <a href={payLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg">Pay Now — {fmtCents(invoice.total_cents)}</Button>
                </a>
              ) : (
                <p className="text-sm" style={{ color: 'var(--color-oak)' }}>
                  A payment link will be sent to you shortly.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSign} className="space-y-5">
              <div>
                <h2 className="heading-card mb-3 text-lg">Terms & Agreement</h2>
                <div
                  className="text-sm whitespace-pre-wrap p-4 rounded-xl max-h-64 overflow-y-auto"
                  style={{ backgroundColor: 'var(--color-ivory-dark)', border: '1px solid var(--color-stone)' }}
                >
                  {invoice.legal_text}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type your full legal name</label>
                <input className="input-field" value={signerName} onChange={(e) => setSignerName(e.target.value)} required placeholder="Jane Smith" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your email (for your records)</label>
                <input type="email" className="input-field" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} placeholder="you@example.com" />
              </div>

              <label className="flex items-start gap-3 cursor-pointer text-sm">
                <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} className="mt-1" required />
                <span>I have reviewed this invoice in full and agree to the terms above.</span>
              </label>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <Button type="submit" disabled={submitting || !reviewed} className="w-full">
                {submitting ? 'Signing…' : 'Sign & Accept'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
