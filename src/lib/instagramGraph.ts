import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const GRAPH_VERSION = 'v27.0';
const REFRESH_AFTER_DAYS = 50; // long-lived tokens last 60 days; refresh well before that

export interface InstagramMediaItem {
  id: string;
  caption: string | null;
  media_type: string;
  media_product_type: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  permalink: string;
  timestamp: string;
}

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

// Reads the current long-lived token from Supabase, seeding it from
// INSTAGRAM_ACCESS_TOKEN on first run, and refreshes it if it's getting old.
// Keeps the live token out of Vercel env vars entirely after the first sync.
export async function getValidAccessToken(): Promise<string> {
  const { data: row } = await supabaseAdmin
    .from('instagram_token')
    .select('access_token, updated_at')
    .eq('id', 1)
    .maybeSingle();

  let token = row?.access_token as string | undefined;
  let updatedAt = row?.updated_at as string | undefined;

  if (!token) {
    const seed = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!seed) throw new Error('No Instagram token stored and INSTAGRAM_ACCESS_TOKEN is not set');
    await supabaseAdmin.from('instagram_token').upsert({ id: 1, access_token: seed, updated_at: new Date().toISOString() });
    return seed;
  }

  if (!updatedAt || daysSince(updatedAt) >= REFRESH_AFTER_DAYS) {
    try {
      const res = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`
      );
      const json = await res.json();
      if (res.ok && json.access_token) {
        token = json.access_token as string;
        await supabaseAdmin.from('instagram_token').upsert({ id: 1, access_token: token, updated_at: new Date().toISOString() });
      } else {
        console.error('Instagram token refresh failed, continuing with existing token:', json);
      }
    } catch (err) {
      console.error('Instagram token refresh request failed, continuing with existing token:', err);
    }
  }

  return token;
}

export async function fetchRecentInstagramMedia(accessToken: string, userId: string): Promise<InstagramMediaItem[]> {
  const fields = 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp';
  const url = `https://graph.instagram.com/${GRAPH_VERSION}/${userId}/media?fields=${fields}&limit=25&access_token=${encodeURIComponent(accessToken)}`;

  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch Instagram media');
  }

  return (json.data ?? []) as InstagramMediaItem[];
}
