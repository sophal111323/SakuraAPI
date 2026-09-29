'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await register({
      name,
      companyName: companyName.trim() || undefined,
      email,
      password,
    });
    setSubmitting(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Failed to create account');
    }
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
          <h2 className="text-xl font-semibold text-white">Create Reseller Account</h2>
          <p className="text-xs text-zinc-400">Join SakuraAPI to distribute automated game top-up services</p>
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
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alexander Wright"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Business / Store Name <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="GameVault Reseller Store"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alexander@gamevault.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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
                  <span>Creating reseller profile...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#221c3b] text-center text-xs text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
