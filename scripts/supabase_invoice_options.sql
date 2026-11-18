-- ============================================
-- INVOICE OPTIONS (multiple quote options per client)
-- ============================================
-- Run AFTER scripts/supabase_invoices.sql, in the Supabase SQL Editor.
--
-- Lets the admin send a client several invoice options under one link
-- (e.g. "Standard Oak" vs "Premium Walnut" for the same project). The
-- client picks one; the chosen invoice continues through the normal
-- sign + pay flow, and the sibling options are automatically voided.

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS group_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS option_label TEXT;

CREATE TABLE IF NOT EXISTS invoice_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  public_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'selected', 'void')),

  selected_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ
);

-- Idempotent FK add (Postgres has no "ADD CONSTRAINT IF NOT EXISTS").
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_group_id_fkey'
  ) THEN
    ALTER TABLE invoices
      ADD CONSTRAINT invoices_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES invoice_groups(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS invoices_group_id_idx ON invoices (group_id);
CREATE INDEX IF NOT EXISTS invoice_groups_public_token_idx ON invoice_groups (public_token);

DROP TRIGGER IF EXISTS update_invoice_groups_updated_at ON invoice_groups;
CREATE TRIGGER update_invoice_groups_updated_at
  BEFORE UPDATE ON invoice_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE invoice_groups ENABLE ROW LEVEL SECURITY;

-- Admin-only. Customer-facing reads/writes for invoice_groups go through
-- Next.js API routes using the service-role key (same pattern as invoices) —
-- customers are authenticated by possessing the group's public_token, not a
-- Supabase session, so there is no anon policy for them here by design.
DROP POLICY IF EXISTS "invoice_groups_admin_all" ON invoice_groups;
CREATE POLICY "invoice_groups_admin_all" ON invoice_groups
  FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));
