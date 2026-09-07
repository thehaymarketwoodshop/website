'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ArrowLeft, Loader2, Plus, X, ExternalLink } from 'lucide-react';
import {
  supabase,
  checkIsAdmin,
  fetchInvoiceWithItems,
  createInvoiceWithItems,
  updateInvoiceWithItems,
  fetchInvoiceSignature,
} from '@/lib/supabaseClient';
import { computeInvoiceTotals, fmtCents, randomInvoiceNumber } from '@/lib/invoiceMath';
import { DEFAULT_LEGAL_AGREEMENT } from '@/lib/legalAgreement';
import { InvoicePreview } from '@/components/InvoicePreview';
import { Button } from '@/components/Button';
import type { DbInvoice, DiscountType, InvoiceItemInput, InvoiceStatus } from '@/types/invoice';

const PAYMENT_TERMS_OPTIONS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'];
const PAYMENT_METHODS = ['Bank Transfer (ACH)', 'Check', 'Credit Card', 'Zelle', 'PayPal', 'Shopify Checkout'];
const TAX_RATES = [0, 5, 6, 7, 8, 8.5, 10];

function today(): string {
  return new Date().toISOString().split('T')[0];
}
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function resizeImageToDataUrl(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read image'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const inp = 'input-field';

export default function AdminInvoiceEditorPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new';
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [invoiceId, setInvoiceId] = useState<string | null>(isNew ? null : params.id);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('draft');
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [meta, setMeta] = useState<Pick<DbInvoice, 'sent_at' | 'viewed_at' | 'signed_at' | 'paid_at' | 'shopify_invoice_url'> | null>(null);
  const [signature, setSignature] = useState<{ signer_name: string; signed_at: string } | null>(null);

  const [buyer, setBuyer] = useState({ company: '', contact: '', address: '', city: '', email: '' });
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(addDays(today(), 30));
  const [terms, setTerms] = useState('Net 30');
  const [items, setItems] = useState<InvoiceItemInput[]>([{ description: '', unit: '', qty: 1, rate: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState('Thank you for your business!');
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['Bank Transfer (ACH)']);
  const [projectDescription, setProjectDescription] = useState('');
  const [renderImageUrl, setRenderImageUrl] = useState<string | null>(null);
  const [legalText, setLegalText] = useState(DEFAULT_LEGAL_AGREEMENT);

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
      if (!admin) { setIsLoading(false); return; }

      if (isNew) {
        setInvoiceNo(randomInvoiceNumber());
        setIsLoading(false);
        return;
      }

      const inv = await fetchInvoiceWithItems(params.id);
      if (!inv) { setNotFound(true); setIsLoading(false); return; }

      setInvoiceId(inv.id);
      setInvoiceNo(inv.invoice_no);
      setStatus(inv.status);
      setPublicToken(inv.public_token);
      setMeta({ sent_at: inv.sent_at, viewed_at: inv.viewed_at, signed_at: inv.signed_at, paid_at: inv.paid_at, shopify_invoice_url: inv.shopify_invoice_url });
      setBuyer({
        company: inv.buyer_company || '',
        contact: inv.buyer_contact || '',
        address: inv.buyer_address || '',
        city: inv.buyer_city || '',
        email: inv.buyer_email || '',
      });
      setIssueDate(inv.issue_date);
      setDueDate(inv.due_date);
      setTerms(inv.terms);
      setItems(
        inv.invoice_items.length
          ? [...inv.invoice_items].sort((a, b) => a.sort_order - b.sort_order).map((it) => ({
              description: it.description,
              unit: it.unit || '',
              qty: it.qty,
              rate: it.rate_cents / 100,
            }))
          : [{ description: '', unit: '', qty: 1, rate: 0 }]
      );
      setTaxRate(inv.tax_rate);
      setShipping(inv.shipping_cents / 100);
      setDiscountType(inv.discount_type);
      setDiscountValue(inv.discount_value);
      setNotes(inv.notes || '');
      setPaymentMethods(inv.payment_methods || []);
      setProjectDescription(inv.project_description || '');
      setRenderImageUrl(inv.render_image_url);
      setLegalText(inv.legal_text || DEFAULT_LEGAL_AGREEMENT);

      if (inv.status === 'signed' || inv.status === 'paid') {
        const sig = await fetchInvoiceSignature(inv.id);
        if (sig) setSignature({ signer_name: sig.signer_name, signed_at: sig.signed_at });
      }
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const totals = useMemo(
    () => computeInvoiceTotals(items, taxRate, shipping, discountType, discountValue),
    [items, taxRate, shipping, discountType, discountValue]
  );

  function addItem() { setItems([...items, { description: '', unit: '', qty: 1, rate: 0 }]); }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, field: keyof InvoiceItemInput, val: string | number) {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: val };
    setItems(copy);
  }
  function toggleMethod(m: string) {
    setPaymentMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }
  function handleTermsChange(t: string) {
    setTerms(t);
    const days = t === 'Due on Receipt' ? 0 : parseInt(t.replace('Net ', '')) || 30;
    setDueDate(addDays(issueDate, days));
  }
  function handleIssueDateChange(d: string) {
    setIssueDate(d);
    const days = terms === 'Due on Receipt' ? 0 : parseInt(terms.replace('Net ', '')) || 30;
    setDueDate(addDays(d, days));
  }

  async function handleRenderUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const dataUrl = await resizeImageToDataUrl(file, 1400, 0.82);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/invoices/upload-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setRenderImageUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    }
    setUploadingImage(false);
  }

  async function handleSave(): Promise<string | null> {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const t = computeInvoiceTotals(items, taxRate, shipping, discountType, discountValue);
      const invoiceFields: Partial<DbInvoice> = {
        invoice_no: invoiceNo,
        buyer_company: buyer.company || null,
        buyer_contact: buyer.contact || null,
        buyer_address: buyer.address || null,
        buyer_city: buyer.city || null,
        buyer_email: buyer.email || null,
        issue_date: issueDate,
        due_date: dueDate,
        terms,
        tax_rate: taxRate,
        shipping_cents: t.shippingCents,
        discount_type: discountType,
        discount_value: Number(discountValue) || 0,
        notes: notes || null,
        payment_methods: paymentMethods,
        project_description: projectDescription || null,
        render_image_url: renderImageUrl,
        legal_text: legalText,
        subtotal_cents: t.subtotalCents,
        discount_cents: t.discountCents,
        tax_cents: t.taxCents,
        total_cents: t.totalCents,
      };
      const itemRows = items.map((it, i) => ({
        description: it.description,
        unit: it.unit || null,
        qty: Number(it.qty) || 0,
        rate_cents: Math.round((Number(it.rate) || 0) * 100),
        sort_order: i,
      }));

      if (invoiceId) {
        await updateInvoiceWithItems(invoiceId, invoiceFields, itemRows);
        setMessage('Saved.');
        return invoiceId;
      }

      const created = await createInvoiceWithItems(invoiceFields, itemRows);
      setInvoiceId(created.id);
      setStatus(created.status);
      setPublicToken(created.public_token);
      setMessage('Saved.');
      router.replace(`/admin/invoices/${created.id}`);
      return created.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!buyer.email) {
      setError('Add a buyer email before sending.');
      return;
    }
    setSending(true);
    setError('');
    setMessage('');
    const id = await handleSave();
    if (!id) { setSending(false); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/invoices/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      setStatus((prev) => (prev === 'draft' ? 'sent' : prev));
      setMessage('Invoice emailed to customer.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
    }
    setSending(false);
  }

  async function handleDownloadPdf() {
    if (!previewRef.current) return;
    setExportingPdf(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`${invoiceNo}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF export failed');
    }
    setExportingPdf(false);
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

  if (notFound) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 pb-20 container-narrow text-center">
        <h1 className="heading-section mb-4">Invoice Not Found</h1>
        <Link href="/admin/invoices" className="link-subtle">← Back to invoices</Link>
      </div>
    );
  }

  const customerLink = publicToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/invoice/${publicToken}` : null;

  return (
    <div className="min-h-screen pt-32 sm:pt-40 pb-20 container-wide">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/invoices" className="p-2 link-subtle">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="heading-section">{isNew ? 'New Invoice' : invoiceNo}</h1>
            <p className="body-regular text-sm capitalize">{status}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" onClick={handleDownloadPdf} disabled={exportingPdf}>
            {exportingPdf ? 'Generating…' : 'Download PDF'}
          </Button>
          <Button variant="secondary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? 'Sending…' : 'Save & Send to Customer'}
          </Button>
        </div>
      </div>

      {error && <div className="card p-4 mb-6 text-red-700 border-red-200 bg-red-50">{error}</div>}
      {message && <div className="card p-4 mb-6 text-green-700 border-green-200 bg-green-50">{message}</div>}

      {(customerLink || meta) && (
        <div className="card p-6 mb-6 space-y-2 text-sm">
          {customerLink && (
            <div>
              <span className="font-semibold">Customer link: </span>
              <a href={customerLink} target="_blank" rel="noopener noreferrer" className="link-subtle underline">{customerLink}</a>
            </div>
          )}
          {meta?.sent_at && <div>Sent: {new Date(meta.sent_at).toLocaleString()}</div>}
          {meta?.viewed_at && <div>Viewed: {new Date(meta.viewed_at).toLocaleString()}</div>}
          {signature && <div>Signed by <strong>{signature.signer_name}</strong> on {new Date(signature.signed_at).toLocaleString()}</div>}
          {meta?.paid_at && <div className="text-green-700 font-semibold">Paid: {new Date(meta.paid_at).toLocaleString()}</div>}
          {meta?.shopify_invoice_url && (
            <div>
              <a href={meta.shopify_invoice_url} target="_blank" rel="noopener noreferrer" className="link-subtle underline inline-flex items-center gap-1">
                Shopify checkout link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="card p-6">
          <h2 className="heading-card mb-4 text-lg">Client (Bill To)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Company Name</label>
              <input className={inp} value={buyer.company} onChange={(e) => setBuyer({ ...buyer, company: e.target.value })} placeholder="Client Co. Inc." />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Contact Person</label>
              <input className={inp} value={buyer.contact} onChange={(e) => setBuyer({ ...buyer, contact: e.target.value })} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Billing Address</label>
              <input className={inp} value={buyer.address} onChange={(e) => setBuyer({ ...buyer, address: e.target.value })} placeholder="456 Client Ave" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">City, State, ZIP</label>
              <input className={inp} value={buyer.city} onChange={(e) => setBuyer({ ...buyer, city: e.target.value })} placeholder="Reston, VA 20190" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Email</label>
              <input className={inp} value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} placeholder="accounts@clientco.com" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="heading-card mb-4 text-lg">Invoice Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Invoice Number</label>
              <input className={inp} value={invoiceNo} readOnly style={{ opacity: 0.7 }} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Issue Date</label>
              <input type="date" className={inp} value={issueDate} onChange={(e) => handleIssueDateChange(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Due Date</label>
              <input type="date" className={inp} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="heading-card mb-4 text-lg">Prospective Project</h2>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Explain the Project</label>
          <textarea className={inp} rows={4} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="Describe the proposed project..." style={{ marginBottom: 16, resize: 'vertical' }} />
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">3D Render / Image</label>
          <input type="file" accept="image/*" onChange={handleRenderUpload} disabled={uploadingImage} />
          {uploadingImage && <p className="text-sm mt-2">Uploading…</p>}
          {renderImageUrl && (
            <div className="mt-3 relative inline-block">
              <img src={renderImageUrl} alt="Project render" style={{ maxWidth: 280, borderRadius: 8, border: '1px solid var(--color-stone)', display: 'block' }} />
              <button onClick={() => setRenderImageUrl(null)} className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-md p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="heading-card mb-4 text-lg">Line Items</h2>
          <div className="flex flex-col gap-3">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input className={`${inp} col-span-5`} value={it.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Service or product" />
                <input className={`${inp} col-span-2`} value={it.unit} onChange={(e) => updateItem(i, 'unit', e.target.value)} placeholder="hrs" />
                <input type="number" className={`${inp} col-span-1`} value={it.qty} min={0} onChange={(e) => updateItem(i, 'qty', e.target.value)} />
                <input type="number" className={`${inp} col-span-2`} value={it.rate} min={0} step="0.01" onChange={(e) => updateItem(i, 'rate', e.target.value)} />
                <div className="col-span-1 text-sm font-semibold text-right">{fmtCents(Math.round((Number(it.qty) || 0) * (Number(it.rate) || 0) * 100))}</div>
                <div className="col-span-1 text-right">
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-red-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="mt-4 text-sm font-semibold link-subtle inline-flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Line Item
          </button>
        </div>

        <div className="card p-6">
          <h2 className="heading-card mb-4 text-lg">Discount</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Discount Type</label>
              <select className={inp} value={discountType} onChange={(e) => setDiscountType(e.target.value as DiscountType)}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">{discountType === 'percent' ? 'Discount (%)' : 'Discount ($)'}</label>
              <input type="number" className={inp} value={discountValue} min={0} step="0.01" onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="heading-card mb-4 text-lg">Totals & Fees</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Tax Rate</label>
              <select className={inp} value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value))}>
                {TAX_RATES.map((r) => <option key={r} value={r}>{r === 0 ? 'No Tax' : `${r}%`}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Shipping & Fees ($)</label>
              <input type="number" className={inp} value={shipping} min={0} step="0.01" onChange={(e) => setShipping(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="w-full sm:w-72 text-sm space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>{fmtCents(totals.subtotalCents)}</span></div>
              {totals.discountCents > 0 && <div className="flex justify-between"><span>Discount</span><span>-{fmtCents(totals.discountCents)}</span></div>}
              {taxRate > 0 && <div className="flex justify-between"><span>Tax ({taxRate}%)</span><span>{fmtCents(totals.taxCents)}</span></div>}
              {totals.shippingCents > 0 && <div className="flex justify-between"><span>Shipping & Fees</span><span>{fmtCents(totals.shippingCents)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t" style={{ borderColor: 'var(--color-stone)' }}>
                <span>Amount Due</span><span>{fmtCents(totals.totalCents)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="heading-card mb-4 text-lg">Payment Terms & Methods</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Payment Terms</label>
              <select className={inp} value={terms} onChange={(e) => handleTermsChange(e.target.value)}>
                {PAYMENT_TERMS_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Accepted Payment Methods</label>
              <div className="flex flex-wrap gap-3 pt-1">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={paymentMethods.includes(m)} onChange={() => toggleMethod(m)} />
                    {m}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="heading-card mb-4 text-lg">Notes / Memo</h2>
          <textarea className={inp} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div className="card p-6">
          <h2 className="heading-card mb-4 text-lg">Legal Agreement Text</h2>
          <p className="body-regular text-sm mb-3">Shown to the customer before they sign. Edit this before sending if it needs to change for this invoice.</p>
          <textarea className={inp} rows={6} value={legalText} onChange={(e) => setLegalText(e.target.value)} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
        </div>
      </div>

      {/* Hidden visual layout used only for PDF capture — off-screen, not display:none (html2canvas needs it rendered) */}
      <div style={{ position: 'fixed', top: 0, left: '-9999px', width: 860 }}>
        <InvoicePreview
          ref={previewRef}
          invoiceNo={invoiceNo}
          issueDate={issueDate}
          dueDate={dueDate}
          terms={terms}
          buyer={buyer}
          items={items}
          taxRate={taxRate}
          shipping={shipping}
          discountType={discountType}
          discountValue={discountValue}
          notes={notes}
          paymentMethods={paymentMethods}
          projectDescription={projectDescription}
          renderImageUrl={renderImageUrl}
        />
      </div>
    </div>
  );
}
