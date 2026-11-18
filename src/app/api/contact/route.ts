import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { contactFormSchema } from '@/lib/validation';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // Max 3 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] ?? 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate with Zod
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { name, email, phone, message, honeypot } = result.data;

    // Check honeypot (spam prevention)
    if (honeypot) {
      // Silently reject but return success to not tip off bots
      return NextResponse.json({ success: true });
    }

    // Check environment variables
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      CONTACT_TO_EMAIL,
    } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
      console.error('Missing email configuration environment variables');
      return NextResponse.json(
        { error: 'Email service not configured. Please try again later.' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: parseInt(SMTP_PORT || '587', 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"The Haymarket Woodshop Website" <${SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: `
New contact form submission from The Haymarket Woodshop website:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}

---
This email was sent from the contact form at haymarketwoodshop.com
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f5f1ed; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; color: #2a201a; }
    .content { background: #fff; padding: 20px; border: 1px solid #e8e0d8; border-top: none; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 16px; }
    .field-label { font-weight: 600; color: #725844; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { margin-top: 4px; }
    .message-box { background: #faf8f6; padding: 16px; border-radius: 8px; margin-top: 16px; }
    .footer { margin-top: 20px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">${name}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:${email}">${email}</a></div>
      </div>
      <div class="field">
        <div class="field-label">Phone</div>
        <div class="field-value">${phone || 'Not provided'}</div>
      </div>
      <div class="message-box">
        <div class="field-label">Message</div>
        <div class="field-value" style="white-space: pre-wrap;">${message}</div>
      </div>
      <div class="footer">
        This email was sent from the contact form at haymarketwoodshop.com
      </div>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
