import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { customOrderSchema } from '@/lib/validation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= MAX_REQUESTS) return false;
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const result = customOrderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }
    const { name, email, phone, description, honeypot } = result.data;
    if (honeypot) return NextResponse.json({ success: true });

    let referenceImageUrl: string | null = null;
    const imageDataUrl = body.imageDataUrl;
    if (typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:image/')) {
      const match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (match) {
        const [, ext, base64] = match;
        const buffer = Buffer.from(base64, 'base64');
        if (buffer.length <= 8 * 1024 * 1024) {
          const filePath = `custom-order-refs/${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from('invoice-assets')
            .upload(filePath, buffer, { contentType: `image/${ext}`, upsert: false });
          if (!uploadError) {
            const { data } = supabaseAdmin.storage.from('invoice-assets').getPublicUrl(filePath);
            referenceImageUrl = data.publicUrl;
          }
        }
      }
    }

    const { error: dbError } = await supabaseAdmin.from('custom_order_requests').insert({
      name,
      email,
      phone: phone || null,
      description,
      reference_image_url: referenceImageUrl,
    });
    if (dbError) {
      console.error('Failed to save custom order request:', dbError);
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    const adminEmail = process.env.INVOICE_ADMIN_EMAIL || process.env.CONTACT_TO_EMAIL;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS && adminEmail) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587', 10),
        secure: parseInt(SMTP_PORT || '587', 10) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"The Haymarket Woodshop Website" <${SMTP_USER}>`,
        to: adminEmail,
        replyTo: email,
        subject: `New Custom Order Request from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\n${description}\n\n${referenceImageUrl ? `Reference image: ${referenceImageUrl}` : ''}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Custom order error:', error);
    return NextResponse.json({ error: 'Failed to submit request. Please try again later.' }, { status: 500 });
  }
}
