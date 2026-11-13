import 'server-only';
import { Resend } from 'resend';

// Built lazily behind a Proxy: `next build` imports every route module to statically
// analyze it, which would otherwise throw here at build time whenever
// RESEND_API_KEY isn't set yet. The client is only actually constructed the first
// time a request handler touches it. Mirrors the supabaseAdmin pattern.
let cached: Resend | null = null;

function getClient(): Resend {
  if (cached) return cached;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  cached = new Resend(apiKey);
  return cached;
}

export const resend: Resend = new Proxy({} as Resend, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

// Sending addresses under the verified thehaymarketwoodshop.com domain, grouped by
// what triggers the email rather than one shared address for everything.
export const FROM_ADDRESS = {
  contact: 'contact@thehaymarketwoodshop.com',
  quotes: 'quotes@thehaymarketwoodshop.com',
  sales: 'sales@thehaymarketwoodshop.com',
} as const;
