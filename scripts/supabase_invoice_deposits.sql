-- ============================================
-- INVOICE DEPOSITS (e.g. 50% up front, 50% upon completion)
-- ============================================
-- Run AFTER scripts/supabase_invoices.sql, in the Supabase SQL Editor.
--
-- Lets an invoice be split into two payments instead of one lump sum: a
-- deposit collected when the client signs, and a balance the admin invoices
-- separately once the work is done. The percentage is set per invoice, not
-- fixed — defaults to 50/50 in the admin UI but can be anything.
--
-- The existing shopify_draft_order_id / shopify_invoice_url / paid_at columns
-- continue to track the FIRST payment (the deposit, when deposit_percent is
-- set; the full amount otherwise) — only the second stage needs new columns.

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deposit_percent NUMERIC;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance_shopify_draft_order_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance_shopify_invoice_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance_sent_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance_paid_at TIMESTAMPTZ;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'deposit_paid', 'paid', 'void'));
