'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield, Key, ArrowRight, AlertCircle, Check, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Failed to authenticate');
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] flex flex-col justify-center items-center px-4 py-12 relative selection:bg-purple-600 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-purple-800/20 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <span className="text-white text-xl">🌸</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Sakura<span className="text-purple-400">API</span>
            </span>
          </Link>
          <h2 className="text-xl font-semibold text-white">Sign in to your account</h2>
          <p className="text-xs text-zinc-400">Enter your credentials to access the reseller or admin portal</p>
        </div>

        {/* Demo Quick-fill Cards */}
        <div className="bg-[#120e24] border border-[#261f43] rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Phase 2 Quick-Fill Testing Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('reseller@sakuraapi.com', 'Reseller@Sakura123!')}
              className="px-2.5 py-1.5 rounded-lg bg-[#1a1436] hover:bg-[#251d4c] border border-[#352963] text-left transition"
            >
              <div className="text-xs font-semibold text-white">Demo Reseller</div>
              <div className="text-[10px] text-zinc-400 truncate">reseller@sakuraapi.com</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('admin@sakuraapi.com', 'Admin@Sakura123!')}
              className="px-2.5 py-1.5 rounded-lg bg-[#1a1436] hover:bg-[#251d4c] border border-[#352963] text-left transition"
            >
              <div className="text-xs font-semibold text-white">Admin Account</div>
              <div className="text-[10px] text-zinc-400 truncate">admin@sakuraapi.com</div>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">Password</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#221c3b] text-center text-xs text-zinc-400">
            Don't have an account yet?{' '}
            <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
              Create reseller account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
