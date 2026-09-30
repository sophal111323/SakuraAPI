'use client';

import React from 'react';
import Link from 'next/link';
import TelegramLoginWidget from '@/components/TelegramLoginWidget';
import { Zap, KeyRound, ShieldCheck, Headphones, Sparkles, ChevronRight } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#080510] text-[#f1f0f7] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-pink-500 selection:text-white">
      {/* Background Animated Video Layer */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#080510]"
        aria-hidden="true"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center pointer-events-none opacity-35"
          tabIndex={-1}
        >
          <source src="/video/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#090714]/85 via-[#0d0922]/85 to-[#080510]/95" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header with Uploaded Logo */}
        <div className="text-center space-y-3 animate-slide-up-1">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>ប្រព័ន្ធចែកចាយស្វ័យប្រវត្តិ &bull; SakuraAPI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              ចុះឈ្មោះគណនី Reseller
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
              ភ្ជាប់ជាមួយ Telegram ផ្ទាល់ខ្លួន ដើម្បីចាប់ផ្តើមលក់សេវាកម្ម Top-up ហ្គេមស្វ័យប្រវត្តិតាម API
            </p>
          </div>
        </div>

        {/* Telegram-Only Registration Card */}
        <div className="bg-[#120d26]/90 backdrop-blur-xl border border-[#2d2256] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/50 space-y-6 relative overflow-hidden animate-slide-up-2">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl pointer-events-none" />

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#171131]/80 border border-[#2c2152] space-y-1 hover:border-pink-500/30 transition">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs font-semibold text-white">បើកដំណើរការភ្លាមៗ</div>
              <div className="text-[10px] text-zinc-400 leading-normal">
                មិនបាច់រង់ចាំការ Approve ចូលប្រើ Dashboard ភ្លាម
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#171131]/80 border border-[#2c2152] space-y-1 hover:border-pink-500/30 transition">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-semibold text-white">ទទួលបាន API Key</div>
              <div className="text-[10px] text-zinc-400 leading-normal">
                ទទួល Production Key សម្រាប់ភ្ជាប់ប្រព័ន្ធ Top-up
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#171131]/80 border border-[#2c2152] space-y-1 hover:border-pink-500/30 transition">
              <div className="w-7 h-7 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xs font-semibold text-white">សុវត្ថិភាព 100%</div>
              <div className="text-[10px] text-zinc-400 leading-normal">
                ការពារកម្រិតខ្ពស់តាមរយៈ Telegram Official OAuth
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#171131]/80 border border-[#2c2152] space-y-1 hover:border-pink-500/30 transition">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xs font-semibold text-white">ជំនួយការផ្ទាល់</div>
              <div className="text-[10px] text-zinc-400 leading-normal">
                ភ្ជាប់ជាមួយ Bot ជូនដំណឹងស្តុក និងប្រតិបត្តិការ
              </div>
            </div>
          </div>

          {/* Telegram Auth Component */}
          <div className="pt-1">
            <TelegramLoginWidget buttonText="ចុះឈ្មោះតាមរយៈ Telegram" />
          </div>

          {/* Sign In Link */}
          <div className="pt-4 border-t border-[#231a44] text-center text-xs text-zinc-400">
            មានគណនីរួចហើយមែនទេ?{' '}
            <Link
              href="/login"
              className="text-pink-400 hover:text-pink-300 font-medium inline-flex items-center gap-0.5 transition"
            >
              <span>ចូលគណនី</span>
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
