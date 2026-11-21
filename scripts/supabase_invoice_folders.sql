-- ============================================
-- INVOICE FOLDERS (custom workflow stages, e.g. In Progress / Sent to Client / Follow Up / Completed)
-- ============================================
-- Run AFTER scripts/supabase_invoices.sql, in the Supabase SQL Editor.
--
-- Folders are fully custom (admin can rename/add/delete/reorder) and are
-- separate from the payment/signing `status` on invoices — a signed, paid
-- invoice can still sit in "Completed", "Follow Up", etc. Deleting a folder
-- just unsorts the invoices in it (ON DELETE SET NULL below), never deletes
-- the invoices themselves.

CREATE TABLE IF NOT EXISTS invoice_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'stone',
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES invoice_folders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS invoices_folder_id_idx ON invoices (folder_id);

ALTER TABLE invoice_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoice_folders_admin_all" ON invoice_folders;
CREATE POLICY "invoice_folders_admin_all" ON invoice_folders
  FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));

-- Seed the four starter folders, but only the very first time this runs
-- (never re-seeds if you've already renamed/deleted/added your own).
INSERT INTO invoice_folders (name, color, sort_order)
SELECT name, color, sort_order FROM (
  VALUES
    ('In Progress', 'amber', 0),
    ('Sent to Client', 'blue', 1),
    ('Follow Up', 'purple', 2),
    ('Completed', 'green', 3)
) AS seed(name, color, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM invoice_folders);
