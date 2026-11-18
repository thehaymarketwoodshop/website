import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getValidAccessToken, fetchRecentInstagramMedia } from '@/lib/instagramGraph';

// Pulls recent reels/posts from the Instagram Graph API and caches them in
// Supabase so site pages never call Instagram directly. See vercel.json for
// the schedule and scripts/supabase_instagram.sql for the schema.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = process.env.INSTAGRAM_USER_ID;
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'INSTAGRAM_USER_ID is not set' }, { status: 500 });
  }

  try {
    const accessToken = await getValidAccessToken();
    const media = await fetchRecentInstagramMedia(accessToken, userId);

    const rows = media.map((m) => ({
      id: m.id,
      caption: m.caption ?? null,
      media_type: m.media_type,
      media_product_type: m.media_product_type ?? null,
      media_url: m.media_url ?? null,
      thumbnail_url: m.thumbnail_url ?? null,
      permalink: m.permalink,
      posted_at: m.timestamp,
      cached_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error } = await supabaseAdmin.from('instagram_media').upsert(rows);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true, synced: rows.length, synced_at: new Date().toISOString() });
  } catch (err) {
    console.error('Instagram sync failed:', err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
