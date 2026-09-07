'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, LogOut, Loader2 } from 'lucide-react';
import { supabase, checkIsAdmin } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/Button';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus();
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await checkAdminStatus();
    } else {
      setIsLoading(false);
    }
  }

  async function checkAdminStatus() {
    setIsAdmin(await checkIsAdmin());
    setIsLoading(false);
  }

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSendingMagicLink(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setIsSendingMagicLink(false);
    if (error) setError(error.message);
    else setMagicLinkSent(true);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-oak)' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 pb-20 container-narrow">
        <h1 className="heading-section mb-2">Admin Login</h1>
        <p className="body-regular mb-8">Sign in with your email to access the admin dashboard.</p>

        {magicLinkSent ? (
          <div className="card p-6">
            <h2 className="font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>Check your email</h2>
            <p className="body-regular text-sm">
              We sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendMagicLink} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-charcoal)' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" disabled={isSendingMagicLink} className="w-full">
              {isSendingMagicLink ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Magic Link'
              )}
            </Button>
          </form>
        )}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 pb-20 container-narrow text-center">
        <h1 className="heading-section mb-2">Access Denied</h1>
        <p className="body-regular mb-8">
          You&apos;re signed in as <strong>{user.email}</strong>, but this email is not in the admin allowlist.
        </p>
        <Button variant="secondary" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 sm:pt-40 pb-20 container-wide">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-section">Admin Dashboard</h1>
          <p className="body-regular mt-1">Signed in as {user.email}</p>
        </div>
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
        <Link href="/admin/invoices" className="card p-8 block group">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
            style={{ backgroundColor: 'var(--color-ivory-dark)' }}
          >
            <FileText className="w-6 h-6" style={{ color: 'var(--color-walnut)' }} />
          </div>
          <h2 className="heading-card mb-2">Invoices</h2>
          <p className="body-regular">Create, send, and track customer invoices — signing status and payment.</p>
        </Link>
      </div>
    </div>
  );
}
