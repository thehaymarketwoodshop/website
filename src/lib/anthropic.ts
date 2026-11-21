import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

// Lazy Proxy-wrapped client (mirrors supabaseAdmin.ts / resend.ts) — `next build`
// imports every route module to statically analyze it, which would otherwise throw
// here whenever ANTHROPIC_API_KEY isn't set yet. The client is only actually
// constructed the first time a request handler touches it.
let cached: Anthropic | null = null;

function getClient(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY environment variable');
  cached = new Anthropic({ apiKey });
  return cached;
}

export const anthropic: Anthropic = new Proxy({} as Anthropic, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

export const EXTRACTION_MODEL = 'claude-sonnet-5-5';
