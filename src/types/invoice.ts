export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'deposit_paid' | 'paid' | 'void';
export type DiscountType = 'percent' | 'flat';
export type InvoiceGroupStatus = 'pending' | 'selected' | 'void';

export interface DbInvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  unit: string | null;
  qty: number;
  rate_cents: number;
  sort_order: number;
}

export interface DbInvoice {
  id: string;
  created_at: string;
  updated_at: string;
  invoice_no: string;
  public_token: string;
  status: InvoiceStatus;
  buyer_company: string | null;
  buyer_contact: string | null;
  buyer_address: string | null;
  buyer_city: string | null;
  buyer_email: string | null;
  issue_date: string;
  due_date: string;
  terms: string;
  tax_rate: number;
  shipping_cents: number;
  discount_type: DiscountType;
  discount_value: number;
  notes: string | null;
  payment_methods: string[];
  project_description: string | null;
  render_image_url: string | null;
  legal_text: string;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  paid_at: string | null;
  shopify_draft_order_id: string | null;
  shopify_invoice_url: string | null;

  // Null = pay the full total at signing (default). Set (e.g. 50) to split
  // payment into a deposit collected at signing and a balance invoiced
  // separately once the work is done. shopify_draft_order_id/shopify_invoice_url/
  // paid_at above track the deposit in that case; the fields below track the balance.
  deposit_percent: number | null;
  deposit_paid_at: string | null;
  balance_shopify_draft_order_id: string | null;
  balance_shopify_invoice_url: string | null;
  balance_sent_at: string | null;
  balance_paid_at: string | null;

  // Set when this invoice is one of several options sent to the same client
  // under a single invoice_groups link (see DbInvoiceGroup).
  group_id: string | null;
  option_label: string | null;

  // Workflow folder (In Progress / Sent to Client / etc.) — independent of
  // `status` above, which tracks payment/signing, not project stage.
  folder_id: string | null;
}

export interface DbInvoiceFolder {
  id: string;
  created_at: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface DbInvoiceReceipt {
  id: string;
  invoice_id: string;
  created_at: string;
  vendor: string | null;
  amount_cents: number;
  receipt_date: string;
  note: string | null;
  file_url: string | null;
}

export interface DbInvoiceWithItems extends DbInvoice {
  invoice_items: DbInvoiceItem[];
}

export interface DbInvoiceGroup {
  id: string;
  created_at: string;
  updated_at: string;
  public_token: string;
  status: InvoiceGroupStatus;
  selected_invoice_id: string | null;
  sent_at: string | null;
  viewed_at: string | null;
}

export interface DbInvoiceGroupWithOptions extends DbInvoiceGroup {
  invoices: DbInvoiceWithItems[];
}

export interface DbInvoiceSignature {
  id: string;
  invoice_id: string;
  signer_name: string;
  signer_email: string | null;
  agreement_text: string;
  ip_address: string | null;
  user_agent: string | null;
  signed_at: string;
}

// Shape used by the admin builder form (dollars, not cents — converted at save time)
export interface InvoiceItemInput {
  description: string;
  unit: string;
  qty: number;
  rate: number; // dollars
}

export interface InvoiceFormData {
  buyer_company: string;
  buyer_contact: string;
  buyer_address: string;
  buyer_city: string;
  buyer_email: string;
  issue_date: string;
  due_date: string;
  terms: string;
  tax_rate: number;
  shipping: number; // dollars
  discount_type: DiscountType;
  discount_value: number;
  notes: string;
  payment_methods: string[];
  project_description: string;
  render_image_url: string | null;
  legal_text: string;
  items: InvoiceItemInput[];
}
