'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { InvoicePreview } from '@/components/InvoicePreview';
import { Button } from '@/components/Button';
import { fmtCents } from '@/lib/invoiceMath';
import type { DbInvoiceGroupWithOptions, DbInvoiceWithItems } from '@/types/invoice';

function OptionCard({
  option,
  onSelect,
  selecting,
}: {
  option: DbInvoiceWithItems;
  onSelect: () => void;
  selecting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="p-6 flex-1">
        <h3 className="heading-card text-lg mb-1">{option.option_label || option.invoice_no}</h3>
        <p className="text-2xl font-bold mb-4" style={{ color: 'var(--color-walnut)' }}>
          {fmtCents(option.total_cents)}
        </p>
        {option.render_image_url && (
          <img
            src={option.render_image_url}
            alt={option.option_label || option.invoice_no}
            style={{ width: '100%', borderRadius: 8, marginBottom: 16, display: 'block' }}
          />
        )}
        <ul className="text-sm space-y-1 mb-3">
          {option.invoice_items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3">
              <span>{it.description}</span>
              <span className="whitespace-nowrap">{fmtCents(Math.round(it.qty * it.rate_cents))}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold link-subtle inline-flex items-center gap-1 mb-2"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Hide full invoice' : 'View full invoice'}
        </button>
        {expanded && (
          <div style={{ border: '1px solid var(--color-stone)', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
            <InvoicePreview
              invoiceNo={option.invoice_no}
              issueDate={option.issue_date}
              dueDate={option.due_date}
              terms={option.terms}
              buyer={{
                company: option.buyer_company || '',
                contact: option.buyer_contact || '',
                address: option.buyer_address || '',
                city: option.buyer_city || '',
                email: option.buyer_email || '',
              }}
              items={option.invoice_items.map((it) => ({ description: it.description, unit: it.unit || '', qty: it.qty, rate: it.rate_cents / 100 }))}
              taxRate={option.tax_rate}
              shipping={option.shipping_cents / 100}
              discountType={option.discount_type}
              discountValue={option.discount_value}
              notes={option.notes || ''}
              paymentMethods={option.payment_methods}
              projectDescription={option.project_description || ''}
              renderImageUrl={option.render_image_url}
            />
          </div>
        )}
      </div>
      <div className="p-6 pt-0">
        <Button onClick={onSelect} disabled={selecting} className="w-full">
          {selecting ? 'Selecting…' : 'Select This Option'}
        </Button>
      </div>
    </div>
  );
}

export default function InvoiceOptionsPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [group, setGroup] = useState<DbInvoiceGroupWithOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/invoice-options/${params.token}`);
        if (!res.ok) { setNotFound(true); setIsLoading(false); return; }
        const json = await res.json();
        if (json.selectedToken) {
          router.replace(`/invoice/${json.selectedToken}`);
          return;
        }
        setGroup(json.group);
      } catch {
        setNotFound(true);
      }
      setIsLoading(false);
    })();
  }, [params.token, router]);

  async function handleSelect(invoiceId: string) {
    setSelectingId(invoiceId);
    setError('');
    try {
      const res = await fetch(`/api/invoice-options/${params.token}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to select option');
      if (json.selectedToken) router.replace(`/invoice/${json.selectedToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select option');
      setSelectingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-oak)' }} />
      </div>
    );
  }

  if (notFound || !group) {
    return (
      <div className="min-h-screen pt-32 pb-20 container-narrow text-center">
        <h1 className="heading-section mb-4">Not Found</h1>
        <p className="body-regular">This link is invalid or has been removed.</p>
      </div>
    );
  }

  if (group.status === 'void') {
    return (
      <div className="min-h-screen pt-32 pb-20 container-narrow text-center">
        <h1 className="heading-section mb-4">No Longer Active</h1>
        <p className="body-regular">Please contact us if you have questions.</p>
      </div>
    );
  }

  const options = group.invoices.filter((inv) => inv.status !== 'void');

  return (
    <div className="min-h-screen pt-16 pb-20" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
      <div className="container-wide pt-16">
        <div className="text-center mb-10">
          <h1 className="heading-section mb-3">Choose Your Option</h1>
          <p className="body-regular">
            We&apos;ve put together {options.length} options for your project. Review each and select the one you&apos;d
            like to move forward with — you&apos;ll then sign and pay for that option.
          </p>
        </div>

        {error && <div className="card p-4 mb-6 text-red-700 border-red-200 bg-red-50 max-w-xl mx-auto text-center">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {options.map((opt) => (
            <OptionCard
              key={opt.id}
              option={opt}
              onSelect={() => handleSelect(opt.id)}
              selecting={selectingId === opt.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
