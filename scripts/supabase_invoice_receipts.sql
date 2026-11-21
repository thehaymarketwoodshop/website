-- ============================================
-- INVOICE RECEIPTS (material/expense receipts per client build)
-- ============================================
-- Run AFTER scripts/supabase_invoices.sql, in the Supabase SQL Editor.
--
-- Receipts belong to one invoice (ON DELETE CASCADE) — since the invoice is
-- what moves between folders, its receipts travel with it automatically; no
-- separate folder tracking is needed on receipts themselves.

CREATE TABLE IF NOT EXISTS invoice_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  vendor TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  file_url TEXT
);

CREATE INDEX IF NOT EXISTS invoice_receipts_invoice_id_idx ON invoice_receipts (invoice_id);

ALTER TABLE invoice_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoice_receipts_admin_all" ON invoice_receipts;
CREATE POLICY "invoice_receipts_admin_all" ON invoice_receipts
  FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));
