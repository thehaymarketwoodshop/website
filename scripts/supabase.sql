-- ============================================
-- THE HAYMARKET WOODSHOP - SUPABASE SCHEMA
-- ============================================
-- Run this script in Supabase SQL Editor

-- ============================================
-- 1. ADMIN ALLOWLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_allowlist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. WOOD TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wood_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. ITEM TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS item_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  buy_url TEXT,
  image_url TEXT,
  size_label TEXT,
  weight_lbs NUMERIC,
  is_in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  wood_type_id UUID REFERENCES wood_types(id) ON DELETE SET NULL,
  item_type_id UUID REFERENCES item_types(id) ON DELETE SET NULL
);

-- ============================================
-- 5. AUTO-UPDATE TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE admin_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE wood_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES - admin_allowlist
-- ============================================
-- Only admins can read their own entry (for verification)
DROP POLICY IF EXISTS "admin_allowlist_select" ON admin_allowlist;
CREATE POLICY "admin_allowlist_select" ON admin_allowlist
  FOR SELECT
  USING (email = auth.jwt()->>'email');

-- ============================================
-- 8. RLS POLICIES - wood_types
-- ============================================
-- Public can SELECT active wood types
DROP POLICY IF EXISTS "wood_types_public_select" ON wood_types;
CREATE POLICY "wood_types_public_select" ON wood_types
  FOR SELECT
  USING (TRUE);

-- Only admins can INSERT
DROP POLICY IF EXISTS "wood_types_admin_insert" ON wood_types;
CREATE POLICY "wood_types_admin_insert" ON wood_types
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_allowlist
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Only admins can UPDATE
DROP POLICY IF EXISTS "wood_types_admin_update" ON wood_types;
CREATE POLICY "wood_types_admin_update" ON wood_types
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_allowlist
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Only admins can DELETE
DROP POLICY IF EXISTS "wood_types_admin_delete" ON wood_types;
CREATE POLICY "wood_types_admin_delete" ON wood_types
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_allowlist
      WHERE email = auth.jwt()->>'email'
    )
  );

-- ============================================
-- 9. RLS POLICIES - item_types
-- ============================================
-- Public can SELECT active item types
DROP POLICY IF EXISTS "item_types_public_select" ON item_types;
CREATE POLICY "item_types_public_select" ON item_types
  FOR SELECT
  USING (TRUE);

-- Only admins can INSERT
DROP POLICY IF EXISTS "item_types_admin_insert" ON item_types;
CREATE POLICY "item_types_admin_insert" ON item_types
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_allowlist
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Only admins can UPDATE
DROP POLICY IF EXISTS "item_types_admin_update" ON item_types;
CREATE POLICY "item_types_admin_update" ON item_types
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_allowlist
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Only admins can DELETE
DROP POLICY IF EXISTS "item_types_admin_delete" ON item_types;
CREATE POLICY "item_types_admin_delete" ON item_types
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_allowlist
      WHERE email = auth.jwt()->>'email'
    )
  );

-- ============================================
-- 10. RLS POLICIES - products
-- ============================================
-- Public can SELECT all products
DROP POLICY IF EXISTS "products_public_select" ON products;
CREATE POLICY "products_public_select" ON products
  FOR SELECT
  USING (TRUE);

-- Only admins can INSERT
DROP POLICY IF EXISTS "products_admin_insert" ON products;
CREATE POLICY "products_admin_insert" ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_allowlist
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Only admins can UPDATE
DROP POLICY IF EXISTS "products_admin_update" ON products;
CREATE POLICY "products_admin_update" ON products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_allowlist
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Only admins can DELETE
DROP POLICY IF EXISTS "products_admin_delete" ON products;
CREATE POLICY "products_admin_delete" ON products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_allowlist
      WHERE email = auth.jwt()->>'email'
    )
  );

-- ============================================
-- 11. SEED DATA - Default Wood Types
-- ============================================
INSERT INTO wood_types (name, sort_order) VALUES
  ('Walnut', 1),
  ('Maple', 2),
  ('Oak', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 12. SEED DATA - Default Item Types
-- ============================================
INSERT INTO item_types (name, sort_order) VALUES
  ('Small Goods', 1),
  ('Tables', 2),
  ('Cabinets', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- IMPORTANT: After running this script, you must:
-- 1. Insert your admin email into admin_allowlist:
--    INSERT INTO admin_allowlist (email) VALUES ('your-email@example.com');
-- 2. Enable Email OTP in Supabase Auth settings
-- ============================================
