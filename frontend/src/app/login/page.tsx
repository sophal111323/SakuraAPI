'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, Zap, ShieldCheck, Headphones, KeyRound } from 'lucide-react';
import TelegramLoginWidget from '@/components/TelegramLoginWidget';

export default function LoginPage() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>ផ្ទាំងគ្រប់គ្រង &bull; SakuraAPI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              ចូលគណនីរបស់អ្នក
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
              ភ្ជាប់ជាមួយ Telegram ផ្ទាល់ខ្លួន ដើម្បីចូលប្រើប្រាស់ផ្ទាំងគ្រប់គ្រង Reseller Dashboard ភ្លាមៗ
            </p>
          </div>
        </div>

        {/* Telegram-Only Login Card */}
        <div className="bg-[#120d26]/90 backdrop-blur-xl border border-[#2d2256] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/50 space-y-6 relative overflow-hidden animate-slide-up-2">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-3xl pointer-events-none" />

          {/* Quick Advantage Badges */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#171131]/80 border border-[#2c2152] space-y-1 hover:border-pink-500/30 transition">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs font-semibold text-white">ចូលប្រើ 1-Click</div>
              <div className="text-[10px] text-zinc-400 leading-normal">
                មិនចាំបាច់វាយលេខសម្ងាត់ ចូលភ្លាមៗ
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#171131]/80 border border-[#2c2152] space-y-1 hover:border-pink-500/30 transition">
              <div className="w-7 h-7 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xs font-semibold text-white">សុវត្ថិភាព 100%</div>
              <div className="text-[10px] text-zinc-400 leading-normal">
                ផ្ទៀងផ្ទាត់ផ្ទាល់តាម Telegram OAuth
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#171131]/80 border border-[#2c2152] space-y-1 hover:border-pink-500/30 transition">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-semibold text-white">គ្រប់គ្រង API Key</div>
              <div className="text-[10px] text-zinc-400 leading-normal">
                ពិនិត្យមើល និង Reset API Key គ្រប់ពេល
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#171131]/80 border border-[#2c2152] space-y-1 hover:border-pink-500/30 transition">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xs font-semibold text-white">ការគាំទ្រ 24/7</div>
              <div className="text-[10px] text-zinc-400 leading-normal">
                ជំនួយការរហ័សតាមប្រព័ន្ធ Telegram
              </div>
            </div>
          </div>

          {/* Telegram Auth Component */}
          <div className="pt-2">
            <TelegramLoginWidget buttonText="ចូលគណនីតាមរយៈ Telegram" />
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
