import 'server-only';
import nodemailer from 'nodemailer';
import type { DbInvoice } from '@/types/invoice';
import { fmtCents, computeDepositSplit } from '@/lib/invoiceMath';

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Missing SMTP environment variables');
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: parseInt(SMTP_PORT || '587', 10) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function adminEmail(): string {
  return process.env.INVOICE_ADMIN_EMAIL || process.env.CONTACT_TO_EMAIL || '';
}

function wrapHtml(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1C1C1C; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F0EDE8; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; color: #1C1C1C; }
    .content { background: #FAF8F5; padding: 20px; border: 1px solid #CFCAC4; border-top: none; border-radius: 0 0 8px 8px; }
    .btn { display: inline-block; margin-top: 16px; padding: 12px 28px; background: #6B4A2D; color: #fff !important; text-decoration: none; border-radius: 999px; font-weight: 600; }
    .field-label { font-weight: 600; color: #6B4A2D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { margin-top: 20px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${title}</h1></div>
    <div class="content">
      ${bodyHtml}
      <div class="footer">The Haymarket Woodshop</div>
    </div>
  </div>
</body>
</html>`.trim();
}

export async function sendInvoiceLink(invoice: DbInvoice, invoiceLink: string) {
  if (!invoice.buyer_email) return;
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"The Haymarket Woodshop" <${process.env.SMTP_USER}>`,
    to: invoice.buyer_email,
    subject: `Invoice ${invoice.invoice_no} from The Haymarket Woodshop`,
    text: `You have a new invoice (${invoice.invoice_no}) for ${fmtCents(invoice.total_cents)}. Review and sign it here: ${invoiceLink}`,
    html: wrapHtml(
      `Invoice ${invoice.invoice_no}`,
      `<p>You have a new invoice from The Haymarket Woodshop for <strong>${fmtCents(invoice.total_cents)}</strong>.</p>
       <p>Please review the details and sign to confirm.</p>
       <a class="btn" href="${invoiceLink}">Review &amp; Sign Invoice</a>`
    ),
  });
}

export async function sendInvoiceOptionsLink(
  buyerEmail: string,
  options: DbInvoice[],
  optionsLink: string
) {
  const transporter = getTransporter();
  const rows = options
    .map(
      (opt) =>
        `<li><strong>${opt.option_label || opt.invoice_no}</strong> — ${fmtCents(opt.total_cents)}</li>`
    )
    .join('');
  const plainRows = options
    .map((opt) => `- ${opt.option_label || opt.invoice_no}: ${fmtCents(opt.total_cents)}`)
    .join('\n');

  await transporter.sendMail({
    from: `"The Haymarket Woodshop" <${process.env.SMTP_USER}>`,
    to: buyerEmail,
    subject: `Choose your option — ${options.length} invoices to review`,
    text: `You have ${options.length} invoice options to choose from:\n\n${plainRows}\n\nReview and select one here: ${optionsLink}`,
    html: wrapHtml(
      'Choose Your Option',
      `<p>We've put together <strong>${options.length} options</strong> for your project.</p>
       <ul>${rows}</ul>
       <p>Review the full details of each and select the one you'd like to move forward with.</p>
       <a class="btn" href="${optionsLink}">Review &amp; Choose an Option</a>`
    ),
  });
}

export async function sendSignedConfirmation(
  invoice: DbInvoice,
  invoiceLink: string,
  signerName: string
) {
  const transporter = getTransporter();
  const admin = adminEmail();

  const hasDeposit = invoice.deposit_percent != null;
  const split = hasDeposit ? computeDepositSplit(invoice.total_cents, invoice.deposit_percent!) : null;
  const dueNowLine = split
    ? `Deposit due now (${invoice.deposit_percent}%): <strong>${fmtCents(split.depositCents)}</strong></p>
       <p>Balance due upon completion: <strong>${fmtCents(split.balanceCents)}</strong>`
    : `Total due: <strong>${fmtCents(invoice.total_cents)}</strong>`;
  const dueNowPlain = split
    ? `Deposit due now (${invoice.deposit_percent}%): ${fmtCents(split.depositCents)}. Balance due upon completion: ${fmtCents(split.balanceCents)}.`
    : `Total due: ${fmtCents(invoice.total_cents)}.`;

  const customerHtml = wrapHtml(
    'Invoice Signed — Confirmation',
    `<p>Thanks, ${signerName}. Your signature on invoice <strong>${invoice.invoice_no}</strong> has been recorded.</p>
     <p>${dueNowLine}</p>
     <a class="btn" href="${invoiceLink}">View Invoice &amp; Pay</a>`
  );

  const sends: Promise<unknown>[] = [];

  if (invoice.buyer_email) {
    sends.push(
      transporter.sendMail({
        from: `"The Haymarket Woodshop" <${process.env.SMTP_USER}>`,
        to: invoice.buyer_email,
        subject: `You signed invoice ${invoice.invoice_no}`,
        text: `Thanks, ${signerName}. Your signature on invoice ${invoice.invoice_no} has been recorded. ${dueNowPlain} View: ${invoiceLink}`,
        html: customerHtml,
      })
    );
  }

  if (admin) {
    sends.push(
      transporter.sendMail({
        from: `"The Haymarket Woodshop Website" <${process.env.SMTP_USER}>`,
        to: admin,
        subject: `Invoice ${invoice.invoice_no} was signed by ${signerName}`,
        text: `${signerName} (${invoice.buyer_email || 'no email'}) signed invoice ${invoice.invoice_no} for ${fmtCents(invoice.total_cents)}.`,
        html: wrapHtml(
          'Invoice Signed',
          `<p><strong>${signerName}</strong> signed invoice <strong>${invoice.invoice_no}</strong>.</p>
           <p>Total due: <strong>${fmtCents(invoice.total_cents)}</strong></p>`
        ),
      })
    );
  }

  await Promise.all(sends);
}

// amountPaidCents defaults to the invoice total — pass the balance amount when this
// is the second payment of a deposit/balance split, so the receipt reflects what was
// actually charged on this stage rather than the full invoice total again.
export async function sendPaymentReceipt(invoice: DbInvoice, amountPaidCents = invoice.total_cents) {
  const transporter = getTransporter();
  const admin = adminEmail();
  const sends: Promise<unknown>[] = [];

  if (invoice.buyer_email) {
    sends.push(
      transporter.sendMail({
        from: `"The Haymarket Woodshop" <${process.env.SMTP_USER}>`,
        to: invoice.buyer_email,
        subject: `Payment received — Invoice ${invoice.invoice_no}`,
        text: `We've received your payment of ${fmtCents(amountPaidCents)} for invoice ${invoice.invoice_no}. This invoice is now paid in full. Thank you!`,
        html: wrapHtml(
          'Payment Received',
          `<p>We've received your payment of <strong>${fmtCents(amountPaidCents)}</strong> for invoice <strong>${invoice.invoice_no}</strong>. This invoice is now paid in full. Thank you!</p>`
        ),
      })
    );
  }

  if (admin) {
    sends.push(
      transporter.sendMail({
        from: `"The Haymarket Woodshop Website" <${process.env.SMTP_USER}>`,
        to: admin,
        subject: `Invoice ${invoice.invoice_no} paid`,
        text: `Invoice ${invoice.invoice_no} was paid in full — ${fmtCents(amountPaidCents)} just received.`,
        html: wrapHtml('Invoice Paid', `<p>Invoice <strong>${invoice.invoice_no}</strong> was paid in full — <strong>${fmtCents(amountPaidCents)}</strong> just received.</p>`),
      })
    );
  }

  await Promise.all(sends);
}

export async function sendDepositReceipt(invoice: DbInvoice, depositCents: number, balanceCents: number) {
  const transporter = getTransporter();
  const admin = adminEmail();
  const sends: Promise<unknown>[] = [];

  if (invoice.buyer_email) {
    sends.push(
      transporter.sendMail({
        from: `"The Haymarket Woodshop" <${process.env.SMTP_USER}>`,
        to: invoice.buyer_email,
        subject: `Deposit received — Invoice ${invoice.invoice_no}`,
        text: `We've received your deposit of ${fmtCents(depositCents)} for invoice ${invoice.invoice_no}. The remaining balance of ${fmtCents(balanceCents)} will be due upon completion — we'll send a payment link then. Thank you!`,
        html: wrapHtml(
          'Deposit Received',
          `<p>We've received your deposit of <strong>${fmtCents(depositCents)}</strong> for invoice <strong>${invoice.invoice_no}</strong>.</p>
           <p>The remaining balance of <strong>${fmtCents(balanceCents)}</strong> will be due upon completion — we'll send a payment link once your piece is ready.</p>`
        ),
      })
    );
  }

  if (admin) {
    sends.push(
      transporter.sendMail({
        from: `"The Haymarket Woodshop Website" <${process.env.SMTP_USER}>`,
        to: admin,
        subject: `Deposit received — Invoice ${invoice.invoice_no}`,
        text: `Deposit of ${fmtCents(depositCents)} received for invoice ${invoice.invoice_no}. Balance of ${fmtCents(balanceCents)} due upon completion — send the balance invoice from the admin when ready.`,
        html: wrapHtml(
          'Deposit Received',
          `<p>Deposit of <strong>${fmtCents(depositCents)}</strong> received for invoice <strong>${invoice.invoice_no}</strong>.</p>
           <p>Balance of <strong>${fmtCents(balanceCents)}</strong> due upon completion — send the balance invoice from the admin when ready.</p>`
        ),
      })
    );
  }

  await Promise.all(sends);
}

export async function sendBalanceDueLink(invoice: DbInvoice, balanceCents: number, balanceLink: string) {
  if (!invoice.buyer_email) return;
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"The Haymarket Woodshop" <${process.env.SMTP_USER}>`,
    to: invoice.buyer_email,
    subject: `Balance due — Invoice ${invoice.invoice_no}`,
    text: `Your piece is ready! The remaining balance of ${fmtCents(balanceCents)} for invoice ${invoice.invoice_no} is now due. Pay here: ${balanceLink}`,
    html: wrapHtml(
      'Balance Due',
      `<p>Your piece is ready! The remaining balance for invoice <strong>${invoice.invoice_no}</strong> is now due.</p>
       <p>Balance due: <strong>${fmtCents(balanceCents)}</strong></p>
       <a class="btn" href="${balanceLink}">Pay Balance</a>`
    ),
  });
}
