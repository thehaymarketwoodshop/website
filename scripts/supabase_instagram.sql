-- ============================================
-- INSTAGRAM FEED CACHE
-- ============================================
-- Run in the Supabase SQL Editor. Depends only on update_updated_at_column()
-- from scripts/supabase.sql.
--
-- A cron job (src/app/api/cron/instagram-sync) pulls recent reels from the
-- Instagram Graph API on a schedule and caches them here, so site pages never
-- call Instagram directly on a page load.

-- ============================================
-- 1. CACHED MEDIA
-- ============================================
CREATE TABLE IF NOT EXISTS instagram_media (
  id TEXT PRIMARY KEY, -- Instagram's own media id — stable, so this doubles as the upsert key
  caption TEXT,
  media_type TEXT NOT NULL,
  media_product_type TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  permalink TEXT NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS instagram_media_posted_at_idx ON instagram_media (posted_at DESC);

ALTER TABLE instagram_media ENABLE ROW LEVEL SECURITY;

-- Public read — this is just cached copies of the business's own public Instagram
-- posts, meant to be displayed on the site. Only the cron job (service-role key,
-- bypasses RLS) ever writes to it.
DROP POLICY IF EXISTS "instagram_media_public_select" ON instagram_media;
CREATE POLICY "instagram_media_public_select" ON instagram_media
  FOR SELECT
  USING (TRUE);

-- ============================================
-- 2. ACCESS TOKEN STORE (singleton row)
-- ============================================
-- Holds the current long-lived Instagram access token so the cron job can
-- self-refresh it every ~50 days without ever touching Vercel env vars.
-- Seeded once from INSTAGRAM_ACCESS_TOKEN on the cron's first run.
-- RLS is enabled with NO policies at all — not even the admin dashboard can
-- read this through a browser session; only the service-role key (server-only
-- cron route) can reach it.
CREATE TABLE IF NOT EXISTS instagram_token (
  id INT PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT instagram_token_singleton CHECK (id = 1)
);

ALTER TABLE instagram_token ENABLE ROW LEVEL SECURITY;
