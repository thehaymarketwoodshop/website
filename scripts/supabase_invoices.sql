-- ============================================
-- THE HAYMARKET WOODSHOP - INVOICING SCHEMA
-- ============================================
-- Run this AFTER scripts/supabase.sql (it depends on admin_allowlist existing).
-- Run in the Supabase SQL Editor.

-- ============================================
-- 1. INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  invoice_no TEXT UNIQUE NOT NULL,
  public_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'paid', 'void')),

  buyer_company TEXT,
  buyer_contact TEXT,
  buyer_address TEXT,
  buyer_city TEXT,
  buyer_email TEXT,

  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  terms TEXT NOT NULL DEFAULT 'Net 30',

  tax_rate NUMERIC NOT NULL DEFAULT 0,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'flat')),
  discount_value NUMERIC NOT NULL DEFAULT 0,

  notes TEXT,
  payment_methods TEXT[] NOT NULL DEFAULT '{}',
  project_description TEXT,
  render_image_url TEXT,
  legal_text TEXT NOT NULL DEFAULT '',

  -- Cached totals — always recomputed server-side before writing (see src/lib/invoiceMath.ts).
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,

  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  shopify_draft_order_id TEXT,
  shopify_invoice_url TEXT
);

CREATE INDEX IF NOT EXISTS invoices_public_token_idx ON invoices (public_token);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices (status);

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  unit TEXT,
  qty NUMERIC NOT NULL DEFAULT 1,
  rate_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items (invoice_id);

-- ============================================
-- 3. INVOICE SIGNATURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  agreement_text TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoice_signatures_invoice_id_idx ON invoice_signatures (invoice_id);

-- ============================================
-- 4. CUSTOM ORDER REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  description TEXT NOT NULL,
  reference_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'closed'))
);

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_requests ENABLE ROW LEVEL SECURITY;

-- Admin-only full access to invoices / invoice_items / invoice_signatures.
-- (Customer-facing reads/writes never use these policies — they go through Next.js
-- API routes using the service-role key, which bypasses RLS. Customers are
-- authenticated by possessing the public_token, not by a Supabase session, so there is
-- no anon policy for them here by design.)
DROP POLICY IF EXISTS "invoices_admin_all" ON invoices;
CREATE POLICY "invoices_admin_all" ON invoices
  FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));

DROP POLICY IF EXISTS "invoice_items_admin_all" ON invoice_items;
CREATE POLICY "invoice_items_admin_all" ON invoice_items
  FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));

DROP POLICY IF EXISTS "invoice_signatures_admin_select" ON invoice_signatures;
CREATE POLICY "invoice_signatures_admin_select" ON invoice_signatures
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));

-- custom_order_requests: anyone can submit a request; only admins can read/manage them.
DROP POLICY IF EXISTS "custom_order_requests_public_insert" ON custom_order_requests;
CREATE POLICY "custom_order_requests_public_insert" ON custom_order_requests
  FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "custom_order_requests_admin_select" ON custom_order_requests;
CREATE POLICY "custom_order_requests_admin_select" ON custom_order_requests
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));

DROP POLICY IF EXISTS "custom_order_requests_admin_update" ON custom_order_requests;
CREATE POLICY "custom_order_requests_admin_update" ON custom_order_requests
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));

DROP POLICY IF EXISTS "custom_order_requests_admin_delete" ON custom_order_requests;
CREATE POLICY "custom_order_requests_admin_delete" ON custom_order_requests
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));

-- ============================================
-- 6. STORAGE BUCKET for render images / reference images
-- ============================================
-- Written server-side only (service-role key), so no anon storage policy is needed.
-- Public read so images display on the customer invoice page / admin site.
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-assets', 'invoice-assets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- IMPORTANT: after running this script, make sure your own email is already in
-- admin_allowlist (from scripts/supabase.sql) — this schema reuses that same table.
-- ============================================
