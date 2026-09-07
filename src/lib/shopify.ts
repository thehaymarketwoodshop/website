import 'server-only';
import crypto from 'crypto';
import type { DbInvoice, DbInvoiceItem } from '@/types/invoice';

const API_VERSION = '2024-01';

function adminApiUrl(path: string): string {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error('Missing SHOPIFY_STORE_DOMAIN');
  return `https://${domain}/admin/api/${API_VERSION}/${path}`;
}

// Apps created via the Shopify Dev Dashboard (as opposed to legacy admin-created custom
// apps) no longer expose a static Admin API token in the merchant UI — Shopify removed
// that in 2026. Instead, the app's client_id/client_secret are exchanged for a
// short-lived (24h) Admin API access token via the client credentials grant. We fetch a
// fresh one on each call rather than caching+refreshing, since invoice signing is a
// low-frequency operation and this keeps the logic simple and never stale.
async function getAdminAccessToken(): Promise<string> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!domain || !clientId || !clientSecret) {
    throw new Error('Missing SHOPIFY_STORE_DOMAIN / SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET');
  }

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Shopify access token exchange failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return json.access_token as string;
}

interface DraftOrderResult {
  draftOrderId: string;
  invoiceUrl: string;
}

// Creates a Shopify Draft Order carrying arbitrary custom line items (not tied to real
// product variants) and returns the Shopify-hosted checkout URL for it. The customer
// pays through the shop's existing Shopify Payments setup — no separate processor.
//
// tax_exempt is set so Shopify never recomputes tax from its own store settings; our
// own computed tax is passed as its own explicit line item instead. This guarantees the
// customer is charged EXACTLY the total they signed for, with no drift from Shopify's
// tax/rounding rules.
export async function createDraftOrderForInvoice(
  invoice: DbInvoice,
  items: DbInvoiceItem[]
): Promise<DraftOrderResult> {
  const token = await getAdminAccessToken();

  const lineItems = items.map((it) => ({
    title: it.description || 'Item',
    price: (it.rate_cents / 100).toFixed(2),
    quantity: Math.max(1, Math.round(it.qty)) || 1,
    taxable: false,
    requires_shipping: false,
  }));

  if (invoice.tax_cents > 0) {
    lineItems.push({
      title: 'Sales Tax',
      price: (invoice.tax_cents / 100).toFixed(2),
      quantity: 1,
      taxable: false,
      requires_shipping: false,
    });
  }

  const draftOrder: Record<string, unknown> = {
    line_items: lineItems,
    tax_exempt: true,
    note: `Invoice ${invoice.invoice_no}`,
    email: invoice.buyer_email || undefined,
    use_customer_default_address: false,
  };

  if (invoice.discount_cents > 0) {
    draftOrder.applied_discount = {
      description: 'Discount',
      value_type: 'fixed_amount',
      value: (invoice.discount_cents / 100).toFixed(2),
    };
  }

  if (invoice.shipping_cents > 0) {
    draftOrder.shipping_line = {
      title: 'Shipping & Fees',
      price: (invoice.shipping_cents / 100).toFixed(2),
    };
  }

  const res = await fetch(adminApiUrl('draft_orders.json'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ draft_order: draftOrder }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Shopify draft order creation failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  const draftOrderId = String(json.draft_order.id);
  const invoiceUrl = json.draft_order.invoice_url as string;

  return { draftOrderId, invoiceUrl };
}

// Verifies the X-Shopify-Hmac-Sha256 header on an incoming webhook against the raw
// request body. Must be called with the UNPARSED body — HMAC is computed over exact bytes.
export function verifyShopifyWebhookHmac(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) return false;

  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');

  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
