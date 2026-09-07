import 'server-only';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Verifies the bearer token the browser sends (from supabase.auth.getSession()) belongs
// to a signed-in user AND that user is in admin_allowlist. Mirrors checkIsAdmin() in
// supabaseClient.ts, but usable server-side where there's no browser session to read.
export async function requireAdmin(request: NextRequest): Promise<{ email: string } | null> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user?.email) return null;

  const { data, error } = await supabaseAdmin
    .from('admin_allowlist')
    .select('email')
    .eq('email', user.email)
    .single();

  if (error || !data) return null;
  return { email: user.email };
}
