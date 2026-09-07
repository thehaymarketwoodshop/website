import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Service-role client — bypasses Row Level Security entirely. Import ONLY from
// server-side code (API routes). Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// Used for anything a customer touches without a Supabase session (they're authenticated
// by possessing an unguessable invoice token, not by auth.jwt()), so RLS's
// admin_allowlist-based policies don't apply to them anyway.
//
// Built lazily behind a Proxy: `next build` imports every route module to statically
// analyze it, which would otherwise throw here at build time whenever
// SUPABASE_SERVICE_ROLE_KEY isn't set yet (e.g. before Supabase is provisioned). The
// client is only actually constructed the first time a request handler touches it.
let cached: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cached) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service-role environment variables');
  }

  cached = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
