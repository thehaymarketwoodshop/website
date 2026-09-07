import { forwardRef } from 'react';
import { computeInvoiceTotals, fmtCents } from '@/lib/invoiceMath';
import type { DiscountType, InvoiceItemInput } from '@/types/invoice';

// The business's own info — one business, so this is a constant rather than per-invoice data.
export const SELLER = {
  company: 'The Haymarket Woodshop',
  city: 'Haymarket, VA 20169',
  phone: '(571) 276-7375',
  email: 'thehaymarketwoodshop@gmail.com',
};

export interface InvoicePreviewProps {
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  terms: string;
  buyer: { company: string; contact: string; address: string; city: string; email: string };
  items: InvoiceItemInput[];
  taxRate: number;
  shipping: number;
  discountType: DiscountType;
  discountValue: number;
  notes: string;
  paymentMethods: string[];
  projectDescription: string;
  renderImageUrl: string | null;
}

function fmtDate(s: string): string {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${m}/${d}/${y}`;
}

function Cap({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 4 }}>{children}</div>;
}

function TotalRow({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569', fontSize: 13 }}>
      <span>{label}</span><span>{val}</span>
    </div>
  );
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(function InvoicePreview(
  { invoiceNo, issueDate, dueDate, terms, buyer, items, taxRate, shipping, discountType, discountValue, notes, paymentMethods, projectDescription, renderImageUrl },
  ref
) {
  const totals = computeInvoiceTotals(items, taxRate, shipping, discountType, discountValue);

  return (
    <div ref={ref} style={{ fontFamily: 'Georgia, serif', background: '#fff', padding: '56px 64px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -2, color: '#1e293b' }}>INVOICE</div>
          <div style={{ marginTop: 6, fontSize: 13, color: '#94a3b8', letterSpacing: 1 }}>#{invoiceNo}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{SELLER.company}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 1.8 }}>
            {SELLER.city}<br />{SELLER.phone}<br />{SELLER.email}
          </div>
        </div>
      </div>

      <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #a5b4fc)', borderRadius: 2, marginBottom: 40 }} />

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28, marginBottom: 44 }}>
        <div>
          <Cap>Bill To</Cap>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{buyer.company || '—'}</div>
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.8, marginTop: 4 }}>
            {buyer.contact && <>{buyer.contact}<br /></>}
            {buyer.address && <>{buyer.address}<br /></>}
            {buyer.city && <>{buyer.city}<br /></>}
            {buyer.email}
          </div>
        </div>
        <div>
          <Cap>Issue Date</Cap>
          <div style={{ fontSize: 14, color: '#1e293b' }}>{fmtDate(issueDate)}</div>
          <div style={{ marginTop: 18 }}><Cap>Payment Due</Cap></div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>{fmtDate(dueDate)}</div>
        </div>
        <div>
          <Cap>Terms</Cap>
          <div style={{ fontSize: 14, color: '#1e293b' }}>{terms}</div>
          <div style={{ marginTop: 18 }}><Cap>Payment Methods</Cap></div>
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7 }}>{paymentMethods.join(', ') || '—'}</div>
        </div>
      </div>

      {/* Prospective Project */}
      {(projectDescription || renderImageUrl) && (
        <div style={{ marginBottom: 40 }}>
          <Cap>Prospective Project</Cap>
          {projectDescription && (
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: renderImageUrl ? 12 : 0 }}>
              {projectDescription}
            </div>
          )}
          {renderImageUrl && <img src={renderImageUrl} alt="Project render" style={{ maxWidth: 320, borderRadius: 8, border: '1px solid #e2e8f0' }} />}
        </div>
      )}

      {/* Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 36, fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            {[['Description', 'left'], ['Unit', 'center'], ['Qty', 'center'], ['Rate', 'right'], ['Amount', 'right']].map(([h, a]) => (
              <th key={h} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', textAlign: a as 'left' | 'right' | 'center' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px', color: '#1e293b', fontWeight: 500 }}>{it.description || '—'}</td>
              <td style={{ padding: '12px', color: '#64748b', textAlign: 'center' }}>{it.unit || '—'}</td>
              <td style={{ padding: '12px', color: '#64748b', textAlign: 'center' }}>{it.qty}</td>
              <td style={{ padding: '12px', color: '#64748b', textAlign: 'right' }}>{fmtCents(Math.round((Number(it.rate) || 0) * 100))}</td>
              <td style={{ padding: '12px', color: '#1e293b', fontWeight: 600, textAlign: 'right' }}>
                {fmtCents(Math.round((Number(it.qty) || 0) * (Number(it.rate) || 0) * 100))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 40 }}>
        <div style={{ width: 300 }}>
          <TotalRow label="Subtotal" val={fmtCents(totals.subtotalCents)} />
          {totals.discountCents > 0 && (
            <TotalRow label={`Discount${discountType === 'percent' ? ` (${discountValue}%)` : ''}`} val={`-${fmtCents(totals.discountCents)}`} />
          )}
          {taxRate > 0 && <TotalRow label={`Tax (${taxRate}%)`} val={fmtCents(totals.taxCents)} />}
          {totals.shippingCents > 0 && <TotalRow label="Shipping & Fees" val={fmtCents(totals.shippingCents)} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 18px', marginTop: 10, background: '#1e293b', borderRadius: 8, fontSize: 16, fontWeight: 700, color: '#fff' }}>
            <span>Amount Due</span><span>{fmtCents(totals.totalCents)}</span>
          </div>
        </div>
      </div>

      {notes && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>{notes}</div>
      )}
    </div>
  );
});
