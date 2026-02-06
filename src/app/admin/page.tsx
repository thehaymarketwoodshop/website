'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, SlidersHorizontal, LogOut, Loader2 } from 'lucide-react';
import { supabase, checkIsAdmin } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

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
    const admin = await checkIsAdmin();
    setIsAdmin(admin);
    setIsLoading(false);
  }

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSendingMagicLink(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    setIsSendingMagicLink(false);

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // Not logged in - show login form
  if (!user) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 pb-20">
        <div className="max-w-md mx-auto px-6">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Admin Login</h1>
          <p className="text-neutral-600 mb-8">Sign in with your email to access the admin dashboard.</p>

          {magicLinkSent ? (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <h2 className="font-semibold text-green-900 mb-2">Check your email</h2>
              <p className="text-green-700 text-sm">
                We sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSendingMagicLink}
                className="w-full px-6 py-3 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSendingMagicLink ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Magic Link'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Access Denied</h1>
          <p className="text-neutral-600 mb-8">
            You&apos;re signed in as <strong>{user.email}</strong>, but this email is not in the admin allowlist.
          </p>
          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-neutral-100 text-neutral-900 font-medium rounded-full hover:bg-neutral-200 transition-colors inline-flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen pt-32 sm:pt-40 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">Admin Dashboard</h1>
            <p className="text-neutral-600 mt-1">Signed in as {user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/admin/products"
            className="p-8 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-woodshop-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-woodshop-200 transition-colors">
              <Package className="w-6 h-6 text-woodshop-700" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Manage Products</h2>
            <p className="text-neutral-600">Add, edit, and delete products. Toggle stock status.</p>
          </Link>

          <Link
            href="/admin/filters"
            className="p-8 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-woodshop-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-woodshop-200 transition-colors">
              <SlidersHorizontal className="w-6 h-6 text-woodshop-700" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Manage Filters</h2>
            <p className="text-neutral-600">Configure wood types and item types for product filtering.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
