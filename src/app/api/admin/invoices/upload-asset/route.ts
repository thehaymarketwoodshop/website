import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ALLOWED_FOLDERS = ['renders', 'receipts'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

// Admin-only file upload (invoice render images, receipt images/PDFs). Goes through the
// service-role client server-side rather than a browser Storage RLS policy, keeping
// every write to the invoice-assets bucket in one place.
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  // imageDataUrl kept for backwards compatibility with the existing render-image uploader.
  const dataUrl: unknown = body.dataUrl ?? body.imageDataUrl;
  const folder: AllowedFolder = ALLOWED_FOLDERS.includes(body.folder) ? body.folder : 'renders';

  if (typeof dataUrl !== 'string') {
    return NextResponse.json({ error: 'Invalid file data' }, { status: 400 });
  }

  const match = dataUrl.match(/^data:(image\/(\w+)|application\/pdf);base64,(.+)$/);
  if (!match) return NextResponse.json({ error: 'Only images or PDFs are supported' }, { status: 400 });

  const [, mimeType, imageExt, base64] = match;
  const ext = mimeType === 'application/pdf' ? 'pdf' : imageExt;
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 400 });
  }

  const filePath = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from('invoice-assets')
    .upload(filePath, buffer, { contentType: mimeType, upsert: false });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from('invoice-assets').getPublicUrl(filePath);
  return NextResponse.json({ url: data.publicUrl });
}
