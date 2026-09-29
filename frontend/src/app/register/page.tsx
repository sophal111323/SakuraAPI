'use client';

import React from 'react';
import Link from 'next/link';
import TelegramLoginWidget from '@/components/TelegramLoginWidget';
import { ShieldCheck, Zap, KeyRound, MessageSquareCode } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] flex flex-col justify-center items-center px-4 py-12 relative selection:bg-purple-600 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-sky-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-600/25">
              <span className="text-white text-2xl">🌸</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Sakura<span className="text-sky-400">API</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Reseller Account</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            SakuraAPI reseller accounts are exclusively registered and authenticated via Telegram for maximum security and automated stock distribution.
          </p>
        </div>

        {/* Telegram-Only Registration Card */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Key Advantages */}
          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-3 rounded-xl bg-[#181333] border border-[#2e235a]/60 space-y-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <div className="text-xs font-semibold text-white">Instant Setup</div>
              <div className="text-[10px] text-zinc-400">No waiting. Live dashboard ready immediately.</div>
            </div>

            <div className="p-3 rounded-xl bg-[#181333] border border-[#2e235a]/60 space-y-1">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <div className="text-xs font-semibold text-white">Instant API Keys</div>
              <div className="text-[10px] text-zinc-400">Production REST API keys auto-generated.</div>
            </div>

            <div className="p-3 rounded-xl bg-[#181333] border border-[#2e235a]/60 space-y-1">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <div className="text-xs font-semibold text-white">Zero Passwords</div>
              <div className="text-[10px] text-zinc-400">Secured cryptographically via Telegram OAuth.</div>
            </div>

            <div className="p-3 rounded-xl bg-[#181333] border border-[#2e235a]/60 space-y-1">
              <MessageSquareCode className="w-4 h-4 text-purple-400" />
              <div className="text-xs font-semibold text-white">Direct Support</div>
              <div className="text-[10px] text-zinc-400">Connected to your Telegram handle for support.</div>
            </div>
          </div>

          {/* Telegram Auth Component */}
          <div className="pt-2">
            <TelegramLoginWidget buttonText="Register with Telegram Account" />
          </div>

          {/* Sign In Link */}
          <div className="pt-4 border-t border-[#221c3b] text-center text-xs text-zinc-400">
            Already registered?{' '}
            <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">
              Sign in with Telegram
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="text-center text-[11px] text-zinc-500">
          Powered by SakuraAPI Reseller Network &bull; Secured with Telegram Auth
        </div>
      </div>
    </div>
  );
}
