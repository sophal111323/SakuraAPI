'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#221c3b] bg-[#070510] mt-24 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Part: Logo and Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="SakuraAPI"
                className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(236,72,153,0.3)] mx-auto sm:mx-0"
              />
            </Link>
            <p className="text-[11px] text-zinc-400">Automated Game Top-up Reseller Platform</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <Link href="/categories" className="hover:text-pink-400 transition">
              ហ្គេម &amp; តម្លៃ
            </Link>
            <Link href="/docs" className="hover:text-pink-400 transition">
              ឯកសារ API
            </Link>
            <Link href="/login" className="hover:text-pink-400 transition">
              ចូលគណនី
            </Link>
            <Link href="/register" className="hover:text-pink-400 transition">
              ចុះឈ្មោះ Reseller
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1a1430]" />

        {/* Middle/Bottom Part: Exact Design Style requested */}
        <div className="flex flex-col items-center justify-center text-center space-y-3.5">
          {/* Payment Section */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-purple-300">
              ទូទាត់តាមរយៈ:
            </span>
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-red-600 text-white font-extrabold tracking-wider text-xs sm:text-sm shadow-lg shadow-red-600/30 border border-red-500/40 select-none">
              KHQR
            </div>
          </div>

          {/* Developed by Sokphal with direct Telegram link to @thephal */}
          <div className="pt-1">
            <a
              href="https://t.me/thephal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-purple-400 hover:text-pink-400 transition group hover:underline underline-offset-4"
              title="Contact Developer on Telegram"
            >
              <span>Developed by Sokphal</span>
            </a>
          </div>

          {/* Terms & Policy */}
          <div>
            <Link
              href="/docs"
              className="text-xs sm:text-sm font-medium text-purple-300/90 hover:text-white transition hover:underline"
            >
              Terms &amp; Policy
            </Link>
          </div>

          {/* Copyright line */}
          <div className="space-y-1 text-[11px] text-zinc-500 pt-1">
            <p>
              &copy; 2026 SakuraAPI. All rights reserved.
            </p>
            <p className="text-zinc-600 text-[10px]">
              Enterprise High-Throughput Game Distribution System
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
