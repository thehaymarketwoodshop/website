import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Admin-only image upload (invoice render images). Goes through the service-role
// client server-side rather than a browser Storage RLS policy, keeping every write to
// the invoice-assets bucket in one place.
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { imageDataUrl } = await request.json();
  if (typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
  }

  const match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });

  const [, ext, base64] = match;
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image too large (max 8MB)' }, { status: 400 });
  }

  const filePath = `renders/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from('invoice-assets')
    .upload(filePath, buffer, { contentType: `image/${ext}`, upsert: false });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from('invoice-assets').getPublicUrl(filePath);
  return NextResponse.json({ url: data.publicUrl });
}
