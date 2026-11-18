import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface CachedInstagramMedia {
  id: string;
  caption: string | null;
  media_type: string;
  media_product_type: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  permalink: string;
  posted_at: string;
}

export async function getFeaturedReels(limit = 6): Promise<CachedInstagramMedia[]> {
  const { data, error } = await supabaseAdmin
    .from('instagram_media')
    .select('id, caption, media_type, media_product_type, media_url, thumbnail_url, permalink, posted_at')
    .order('posted_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to load cached Instagram media:', error);
    return [];
  }
  return (data ?? []) as CachedInstagramMedia[];
}
