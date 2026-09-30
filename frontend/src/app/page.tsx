'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Code2, 
  Gamepad2, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal, 
  Layers, 
  Headphones, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Wallet
} from 'lucide-react';

export default function Home() {
  const { user, reseller } = useAuth();
  const [copied, setCopied] = useState(false);

  const sampleCurl = `curl -X POST https://sakuraapi.lol/api/v1/orders \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game": "mobile-legends",
    "userid": "1473883595",
    "serverid": "14309",
    "product_code": "MLBB_86"
  }'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const popularGames = [
    {
      name: 'Mobile Legends: Bang Bang',
      category: 'MOBA',
      features: 'Auto Check-ID • Weekly Pass • Diamonds',
      tag: 'ពេញនិយមបំផុត',
      badgeColor: 'from-pink-500 to-purple-500',
    },
    {
      name: 'Garena Free Fire',
      category: 'Battle Royale',
      features: 'Instant Player ID • Diamonds Auto-Push',
      tag: 'ល្បឿនលឿន',
      badgeColor: 'from-amber-500 to-orange-500',
    },
    {
      name: 'PUBG Mobile',
      category: 'Shooter',
      features: 'Global & Regional UC • Instant Delivery',
      tag: 'Hot Stock',
      badgeColor: 'from-sky-500 to-indigo-500',
    },
    {
      name: 'Honor of Kings',
      category: 'MOBA',
      features: 'Direct Tokens • Weekly Card Auto Fulfillment',
      tag: 'New Game',
      badgeColor: 'from-emerald-500 to-teal-500',
    },
    {
      name: 'Genshin Impact',
      category: 'RPG',
      features: 'Genesis Crystals • Blessing of Welkin Moon',
      tag: 'Global Server',
      badgeColor: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Roblox & Digital Codes',
      category: 'Gift Cards',
      features: 'Robux Fast Top-up • Steam & E-Vouchers',
      tag: 'Instant Voucher',
      badgeColor: 'from-rose-500 to-red-500',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'ល្បឿនបញ្ចូលស្វ័យប្រវត្តិ (< 3s)',
      desc: 'ប្រព័ន្ធបញ្ចូល Diamond និង UC ដោយផ្ទាល់តាមរយៈ API ក្នុងរយៈពេលតែប៉ុន្មានវិនាទីប៉ុណ្ណោះ គ្មានការរង់ចាំដោយដៃ។',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: ShieldCheck,
      title: 'ប្រព័ន្ធ Auto-Refund សុវត្ថិភាព 100%',
      desc: 'ប្រសិនបើ Player ID មិនត្រឹមត្រូវ ឬមានបញ្ហាបច្ចេកទេស ប្រព័ន្ធនឹងបង្វិលប្រាក់ត្រឡប់មកក្នុងកាបូប Reseller វិញភ្លាមៗ។',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: Code2,
      title: 'API ងាយស្រួលភ្ជាប់ (REST & Webhooks)',
      desc: 'ងាយស្រួលសមាហរណកម្មទៅកាន់ Website, Discord Bot ឬ Telegram Bot របស់អ្នកជាមួយ Code Sample ពេញលេញ។',
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      icon: Headphones,
      title: 'ជំនួយការ & Telegram Support 24/7',
      desc: 'ភ្ជាប់ជាមួយ Telegram ផ្ទាល់ខ្លួន ទទួលបានដំណឹងពីប្រតិបត្តិការ និងការគាំទ្របច្ចេកទេសយ៉ាងឆាប់រហ័សគ្រប់ពេលវេលា។',
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080510] text-[#f1f0f7] selection:bg-pink-500 selection:text-white relative overflow-hidden">
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
          className="w-full h-full object-cover object-center pointer-events-none opacity-40 sm:opacity-45"
          tabIndex={-1}
        >
          <source src="/video/background.mp4" type="video/mp4" />
        </video>

        {/* Dark Purple / Sakura Overlay to ensure high contrast, readability & premium aesthetics */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090714]/85 via-[#0d0922]/80 to-[#080510]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-transparent to-[#080510]/75" />
      </div>

      {/* Navigation */}
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-20">
        {/* User Session Banner (if logged in) */}
        {user && (
          <div className="bg-gradient-to-r from-purple-950/50 via-[#181135] to-[#120d26] border border-purple-500/30 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5">
                <div className="w-full h-full bg-[#0e0a1f] rounded-[14px] flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{user.name}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    user.role === 'ADMIN'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                  }`}>
                    {user.role} គណនី
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {user.telegram || user.email} {reseller?.companyName ? `• ${reseller.companyName}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {reseller && (
                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">សមតុល្យក្នុងគណនី (Wallet)</div>
                  <div className="text-xl font-extrabold text-emerald-400">
                    ${parseFloat(reseller.balance).toFixed(2)} <span className="text-xs text-zinc-500">{reseller.currency}</span>
                  </div>
                </div>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs transition shadow-lg shadow-pink-600/25 flex items-center gap-1.5"
              >
                <span>ចូលទៅកាន់ Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/25 text-pink-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>ប្រព័ន្ធចែកចាយស្វ័យប្រវត្តិកំពូល • Next-Gen Game Top-up API</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            ប្រព័ន្ធ Top-up ហ្គេមស្វ័យប្រវត្តិ <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400">
              សម្រាប់តំណាងចែកចាយ (Reseller)
            </span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            SakuraAPI ផ្ដល់ជូនដំណោះស្រាយ API ល្បឿនលឿន និងស្តុកហ្គេមកំពូលៗ (Mobile Legends, Free Fire, PUBG...) ដោយស្វ័យប្រវត្តិតាមរយៈ Telegram 100% ដំណើរការ 24/7 គ្មានការរអាក់រអួល។
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 shadow-xl shadow-purple-600/30 flex items-center gap-2 active:scale-95"
            >
              <span>ចុះឈ្មោះជា Reseller (តាម Telegram)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/docs"
              className="px-6 py-3.5 rounded-2xl bg-[#140e2d] hover:bg-[#1e1544] border border-[#302358] text-zinc-200 font-semibold text-sm transition flex items-center gap-2 shadow-lg"
            >
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>ពិនិត្យមើល API Docs</span>
            </Link>
          </div>

          {/* Stats Ribbon */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#120d26]/80 border border-[#271d4a] text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">99.98%</div>
              <div className="text-xs text-zinc-400 mt-0.5">ស្ថិរភាពប្រព័ន្ធ (Uptime)</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#120d26]/80 border border-[#271d4a] text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-pink-400">&lt; 3.0s</div>
              <div className="text-xs text-zinc-400 mt-0.5">ល្បឿនបញ្ចូលស្វ័យប្រវត្តិ</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#120d26]/80 border border-[#271d4a] text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">50+</div>
              <div className="text-xs text-zinc-400 mt-0.5">ហ្គេម & សេវាកម្មកំពូល</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#120d26]/80 border border-[#271d4a] text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">24/7</div>
              <div className="text-xs text-zinc-400 mt-0.5">សេវាកម្មស្វ័យប្រវត្តិ</div>
            </div>
          </div>
        </section>

        {/* Popular Games Catalog */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400 uppercase tracking-wider mb-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>ស្តុកហ្គេមដែលគាំទ្រ (Supported Games)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">ហ្គេមពេញនិយមដែលកំពុងដំណើរការ</h2>
            </div>
            <Link
              href="/categories"
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold inline-flex items-center gap-1 transition"
            >
              <span>មើលបញ្ជីផលិតផលទាំងអស់</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularGames.map((game, idx) => (
              <div
                key={idx}
                className="group p-5 rounded-2xl bg-[#120d26]/90 border border-[#271d4a] hover:border-pink-500/40 hover:bg-[#181135] transition-all duration-300 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${game.badgeColor} text-white shadow-sm`}>
                    {game.tag}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">{game.category}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition">
                    {game.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {game.features}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#221942] flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ស្វ័យប្រវត្តិភ្លាមៗ
                  </span>
                  <span className="text-zinc-500 group-hover:text-pink-400 transition font-medium flex items-center gap-0.5">
                    បញ្ជាទិញតាម API <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us Features */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">ហេតុអ្វីត្រូវជ្រើសរើស SakuraAPI?</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              ប្រព័ន្ធដែលរចនាឡើងយ៉ាងម៉ត់ចត់ដើម្បីផ្ដល់ទំនុកចិត្តខ្ពស់បំផុតដល់ម្ចាស់អាជីវកម្ម Top-up
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#120d26]/80 border border-[#271d4a] hover:border-purple-500/40 transition space-y-3"
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive API Preview Code Block */}
        <section className="bg-[#120d26] border border-[#2b2055] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>គំរូកូដសមាហរណកម្ម (API Integration Preview)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">ភ្ជាប់ជាមួយប្រព័ន្ធរបស់អ្នកក្នុងរយៈពេល ៥ នាទី</h2>
            </div>

            <button
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 rounded-xl bg-[#1b143a] hover:bg-[#251c52] border border-[#372b6b] text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 self-start md:self-auto"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">បានចម្លងរួចរាល់!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>ចម្លង cURL Command</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#080612] border border-[#241a45] rounded-2xl p-4 sm:p-5 overflow-x-auto font-mono text-xs text-pink-300 leading-relaxed">
            <pre>{sampleCurl}</pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#171131] border border-[#261c48] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-zinc-300">គាំទ្រ JSON Schema ស្តង់ដារ</span>
            </div>

            <div className="p-3 rounded-xl bg-[#171131] border border-[#261c48] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-zinc-300">ពិនិត្យ Player ID ដោយស្វ័យប្រវត្តិ</span>
            </div>

            <div className="p-3 rounded-xl bg-[#171131] border border-[#261c48] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-zinc-300">មាន Swagger Docs ពេញលេញ</span>
            </div>
          </div>
        </section>

        {/* 3 Steps To Start */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">របៀបចាប់ផ្តើមលក់សេវាកម្ម Top-up</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              ដំណើរការងាយស្រួល ៣ ជំហាន ដើម្បីក្លាយជាដៃគូចែកចាយផ្លូវការ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-[#120d26]/80 border border-[#271d4a] space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold text-sm flex items-center justify-center font-mono">
                01
              </div>
              <h3 className="text-base font-bold text-white">ចុះឈ្មោះតាម Telegram</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                ចុចតែមួយ Click តាមរយៈគណនី Telegram ផ្ទាល់ខ្លួន មិនចាំបាច់បំពេញលេខសម្ងាត់ ឬរង់ចាំការអនុម័តឡើយ។
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#120d26]/80 border border-[#271d4a] space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-sm flex items-center justify-center font-mono">
                02
              </div>
              <h3 className="text-base font-bold text-white">បញ្ចូលសមតុល្យ (Fund Wallet)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                បញ្ចូលទឹកប្រាក់តាមរយៈគណនីធនាគារ (ABA / Bakong) ឬទំនាក់ទំនង Admin ដើម្បីបញ្ចូលលុយទៅក្នុងកាបូប។
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#120d26]/80 border border-[#271d4a] space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-sm flex items-center justify-center font-mono">
                03
              </div>
              <h3 className="text-base font-bold text-white">ទាញយក API Key & ចាប់ផ្តើម</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                បង្កើត Production API Key សម្រាប់ភ្ជាប់ប្រព័ន្ធលក់ដោយស្វ័យប្រវត្តិ ឬកុម្ម៉ង់ផ្ទាល់លើ Reseller Dashboard។
              </p>
            </div>
          </div>
        </section>

        {/* Call To Action Banner */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-pink-900/30 via-purple-900/40 to-sky-900/30 border border-purple-500/40 shadow-2xl text-center space-y-5 relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              ត្រៀមខ្លួនពង្រីកអាជីវកម្ម Top-up របស់អ្នកហើយឬនៅ?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              ចូលរួមជាមួយបណ្តាញតំណាងចែកចាយ SakuraAPI ថ្ងៃនេះ ដើម្បីទទួលបានតម្លៃដើម និងប្រព័ន្ធស្វ័យប្រវត្តិ។
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-xl shadow-purple-600/30 flex items-center gap-2"
              >
                <span>ចុះឈ្មោះជា Reseller ឥឡូវនេះ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Enterprise Real Footer */}
      <footer className="border-t border-[#221c3b] bg-[#070510] mt-24 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-sky-400 overflow-hidden bg-[#0e0a1f]">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white">
                  Sakura<span className="text-pink-400">API</span>
                </span>
                <p className="text-[11px] text-zinc-500">Automated Game Top-up Reseller Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-400">
              <Link href="/categories" className="hover:text-pink-400 transition">
                ហ្គេម & តម្លៃ
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

          <div className="border-t border-[#1a1430] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
            <p>sakuraapi.lol &copy; 2026 SakuraAPI. រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
            <p className="text-zinc-600">Enterprise High-Throughput Game Distribution System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
