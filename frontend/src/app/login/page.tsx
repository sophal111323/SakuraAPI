'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, AlertCircle, Loader2, Sparkles, Send, Lock, User as UserIcon, ChevronRight } from 'lucide-react';
import TelegramLoginWidget from '@/components/TelegramLoginWidget';

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
      setError(res.error || 'ការចូលគណនីមិនជោគជ័យ សូមពិនិត្យព័ត៌មានឡើងវិញ');
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#090714] text-[#f1f0f7] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-pink-500 selection:text-white">
      {/* Background Neon Gradients & Ambient Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-b from-purple-600/20 via-fuchsia-600/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f16380f_1px,transparent_1px),linear-gradient(to_bottom,#1f16380f_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header with Uploaded Logo */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group transition-transform duration-300 hover:scale-105">
            <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-sky-400 shadow-2xl shadow-purple-600/40">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#0e0a1f] flex items-center justify-center p-1.5">
                <img
                  src="/logo.png"
                  alt="SakuraAPI Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]"
                />
              </div>
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-pink-500/30 to-sky-400/30 blur-lg -z-10 group-hover:blur-xl transition" />
            </div>
          </Link>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>ផ្ទាំងគ្រប់គ្រង &bull; SakuraAPI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              ចូលគណនីរបស់អ្នក
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
              ភ្ជាប់ជាមួយ Telegram ផ្ទាល់ខ្លួន ឬចូលគណនីជាមួយលេខសម្ងាត់សម្រាប់ Admin
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#120d26]/90 backdrop-blur-xl border border-[#2d2256] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/50 space-y-6 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-3xl pointer-events-none" />

          {/* Telegram 1-Click Fast Login Section */}
          <div className="bg-[#171131]/90 border border-[#32255c] rounded-2xl p-4 text-center space-y-2.5">
            <div className="text-xs font-semibold text-white flex items-center justify-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>ចូលគណនីលឿនរហ័សជាមួយ Telegram</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              ចុចតែមួយ Click ចូលប្រើប្រាស់ Dashboard បានភ្លាមៗដោយស្វ័យប្រវត្តិ
            </p>
            <div className="pt-1">
              <TelegramLoginWidget buttonText="ចូលគណនីតាមរយៈ Telegram" />
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[#231a44] w-full" />
            <span className="bg-[#120d26] px-3 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold absolute">
              ឬចូលដោយប្រើ Email & Password
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Manual Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Email ឬ គណនី Telegram (@username)</span>
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ឧទាហរណ៍៖ alexander@company.com ឬ @username"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#090714] border border-[#2b2050] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-pink-400" />
                <span>លេខសម្ងាត់ (Password)</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#090714] border border-[#2b2050] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងផ្ទៀងផ្ទាត់...</span>
                </>
              ) : (
                <>
                  <span>ចូលគណនី</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill Demo Cards for Testing */}
          <div className="bg-[#171131]/60 border border-[#261c46] rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>គណនីសាកល្បង Quick-Fill Demo / Admin</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('reseller@sakuraapi.com', 'Reseller@Sakura123!')}
                className="px-2.5 py-1.5 rounded-xl bg-[#0e0a1f] hover:bg-[#1a1436] border border-[#2f2355] text-left transition"
              >
                <div className="text-xs font-semibold text-white">Demo Reseller</div>
                <div className="text-[10px] text-zinc-400 truncate">reseller@sakuraapi.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('admin@sakuraapi.com', 'Admin@Sakura123!')}
                className="px-2.5 py-1.5 rounded-xl bg-[#0e0a1f] hover:bg-[#1a1436] border border-[#2f2355] text-left transition"
              >
                <div className="text-xs font-semibold text-white">Admin Portal</div>
                <div className="text-[10px] text-zinc-400 truncate">admin@sakuraapi.com</div>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="pt-4 border-t border-[#231a44] text-center text-xs text-zinc-400">
            មិនទាន់មានគណនីមែនទេ?{' '}
            <Link
              href="/register"
              className="text-pink-400 hover:text-pink-300 font-medium inline-flex items-center gap-0.5 transition"
            >
              <span>ចុះឈ្មោះជាមួយ Telegram ភ្លាមៗ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="text-center text-[11px] text-zinc-500 space-y-1">
          <p>SakuraAPI Distribution Platform &bull; Secured with Telegram Auth</p>
          <p className="text-[10px] text-zinc-600">sakuraapi.lol &copy; 2026. រក្សាសិទ្ធិគ្រប់យ៉ាង</p>
        </div>
      </div>
    </div>
  );
}
