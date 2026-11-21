import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { anthropic, EXTRACTION_MODEL } from '@/lib/anthropic';

const EXTRACTION_PROMPT = `You are reading a scanned or photographed invoice/quote document for a furniture
and cabinetry business, so it can be imported into their invoicing system. Extract the data below and
respond with ONLY a single JSON object — no markdown fences, no commentary before or after it.

Shape (use null for anything not present or not legible; never invent values):
{
  "invoice_no": string | null,          // the document's own invoice/quote number, if printed on it
  "buyer_company": string | null,
  "buyer_contact": string | null,       // person's name
  "buyer_address": string | null,       // street address only
  "buyer_city": string | null,          // "City, State ZIP"
  "buyer_email": string | null,
  "issue_date": string | null,          // "YYYY-MM-DD"
  "due_date": string | null,            // "YYYY-MM-DD"
  "terms": string | null,               // e.g. "Net 30", "Due on Receipt" — as printed
  "items": [
    { "description": string, "unit": string | null, "qty": number, "rate": number }
    // rate is the per-unit price in DOLLARS (not cents)
  ],
  "tax_rate": number | null,            // percent, e.g. 6 for 6%
  "shipping": number | null,            // dollars
  "discount_type": "percent" | "flat" | null,
  "discount_value": number | null,
  "notes": string | null,
  "project_description": string | null  // what the job/project is, if described
}

If a field spans multiple lines or is ambiguous, make your best reasonable reading. Numbers must be
plain JSON numbers, not strings. If you cannot find any line items at all, return an empty array for
"items".`;

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { dataUrl } = await request.json();
  if (typeof dataUrl !== 'string') {
    return NextResponse.json({ error: 'Invalid file data' }, { status: 400 });
  }

  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|gif|webp)|application\/pdf);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: 'Only JPEG/PNG/GIF/WebP images or PDF files are supported' }, { status: 400 });
  }
  const [, mediaType, base64] = match;

  const fileBlock =
    mediaType === 'application/pdf'
      ? { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 } }
      : { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: base64 } };

  try {
    const response = await anthropic.messages.create({
      model: EXTRACTION_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [fileBlock, { type: 'text', text: EXTRACTION_PROMPT }],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from the model' }, { status: 502 });
    }

    const cleaned = textBlock.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    let extracted: unknown;
    try {
      extracted = JSON.parse(cleaned);
    } catch {
      console.error('Invoice import: failed to parse model output:', cleaned);
      return NextResponse.json({ error: 'Could not read structured data from that file' }, { status: 502 });
    }

    return NextResponse.json({ data: extracted });
  } catch (err) {
    console.error('Invoice import failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Import failed' }, { status: 500 });
  }
}
