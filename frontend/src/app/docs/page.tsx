'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  BookOpen,
  Copy,
  Check,
  Terminal,
  Code2,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Layers,
  Zap,
  AlertCircle,
  Sparkles,
  Server,
  ArrowRight,
  KeyRound,
  Gamepad2,
  Receipt,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle
} from 'lucide-react';

export default function ApiDocsPage() {
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'php' | 'python'>('curl');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('auth');

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getExampleCode = (endpoint: string) => {
    switch (endpoint) {
      case 'auth':
        if (activeLang === 'curl') {
          return `curl -X GET https://sakuraapi.lol/api/v1/reseller/me \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;
        }
        if (activeLang === 'js') {
          return `const axios = require('axios');

const res = await axios.get('https://sakuraapi.lol/api/v1/reseller/me', {
  headers: {
    'Authorization': 'Bearer sk_live_YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
console.log(res.data);`;
        }
        if (activeLang === 'php') {
          return `<?php
$ch = curl_init("https://sakuraapi.lol/api/v1/reseller/me");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer sk_live_YOUR_API_KEY",
    "Content-Type: application/json"
]);
$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
        }
        return `import requests

headers = {
    "Authorization": "Bearer sk_live_YOUR_API_KEY",
    "Content-Type": "application/json"
}
response = requests.get("https://sakuraapi.lol/api/v1/reseller/me", headers=headers)
print(response.json())`;

      case 'check-id':
        if (activeLang === 'curl') {
          return `curl -X POST https://sakuraapi.lol/api/v1/games/check-id \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game": "mobile-legends",
    "userid": "1473883595",
    "serverid": "14309"
  }'`;
        }
        if (activeLang === 'js') {
          return `const axios = require('axios');

async function checkPlayerId() {
  const response = await axios.post('https://sakuraapi.lol/api/v1/games/check-id', {
    game: 'mobile-legends',
    userid: '1473883595',
    serverid: '14309'
  }, {
    headers: {
      'Authorization': 'Bearer sk_live_YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });

  console.log(response.data);
}`;
        }
        if (activeLang === 'php') {
          return `<?php
$data = [
    "game" => "mobile-legends",
    "userid" => "1473883595",
    "serverid" => "14309"
];

$ch = curl_init("https://sakuraapi.lol/api/v1/games/check-id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer sk_live_YOUR_API_KEY",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
        }
        return `import requests

url = "https://sakuraapi.lol/api/v1/games/check-id"
headers = {
    "Authorization": "Bearer sk_live_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "game": "mobile-legends",
    "userid": "1473883595",
    "serverid": "14309"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

      case 'create-order':
        if (activeLang === 'curl') {
          return `curl -X POST https://sakuraapi.lol/api/v1/orders \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game": "mobile-legends",
    "product_code": "mlbb-86",
    "userid": "1473883595",
    "serverid": "14309",
    "reseller_order_id": "ORD-20260930-001"
  }'`;
        }
        if (activeLang === 'js') {
          return `const axios = require('axios');

async function createTopupOrder() {
  const response = await axios.post('https://sakuraapi.lol/api/v1/orders', {
    game: 'mobile-legends',
    product_code: 'mlbb-86',
    userid: '1473883595',
    serverid: '14309',
    reseller_order_id: 'ORD-20260930-001'
  }, {
    headers: {
      'Authorization': 'Bearer sk_live_YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });

  console.log(response.data);
}`;
        }
        if (activeLang === 'php') {
          return `<?php
$data = [
    "game" => "mobile-legends",
    "product_code" => "mlbb-86",
    "userid" => "1473883595",
    "serverid" => "14309",
    "reseller_order_id" => "ORD-20260930-001"
];

$ch = curl_init("https://sakuraapi.lol/api/v1/orders");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer sk_live_YOUR_API_KEY",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
        }
        return `import requests

url = "https://sakuraapi.lol/api/v1/orders"
headers = {
    "Authorization": "Bearer sk_live_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "game": "mobile-legends",
    "product_code": "mlbb-86",
    "userid": "1473883595",
    "serverid": "14309",
    "reseller_order_id": "ORD-20260930-001"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

      case 'get-games':
        if (activeLang === 'curl') {
          return `curl -X GET https://sakuraapi.lol/api/v1/games \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY"`;
        }
        if (activeLang === 'js') {
          return `const axios = require('axios');

const res = await axios.get('https://sakuraapi.lol/api/v1/games', {
  headers: { 'Authorization': 'Bearer sk_live_YOUR_API_KEY' }
});
console.log(res.data);`;
        }
        if (activeLang === 'php') {
          return `<?php
$ch = curl_init("https://sakuraapi.lol/api/v1/games");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer sk_live_YOUR_API_KEY"]);
$res = curl_exec($ch);
curl_close($ch);
echo $res;`;
        }
        return `import requests

res = requests.get("https://sakuraapi.lol/api/v1/games", headers={"Authorization": "Bearer sk_live_YOUR_API_KEY"})
print(res.json())`;

      default:
        return '';
    }
  };

  const navLinks = [
    { id: 'quickstart', label: '១. ចាប់ផ្ដើមរហ័ស (Overview)', icon: Sparkles },
    { id: 'auth', label: '២. ការផ្ទៀងផ្ទាត់ (Authentication)', icon: KeyRound },
    { id: 'check-id', label: '៣. ឆែក Player ID (Check ID)', icon: UserCheck },
    { id: 'orders', label: '៤. បញ្ជាទិញ Top-up (Create Order)', icon: Receipt },
    { id: 'games', label: '៥. បញ្ជីហ្គេម & ស្តុក (Games Catalog)', icon: Gamepad2 },
    { id: 'errors', label: '៦. កូដកំហុស (Error Responses)', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-[#080510] text-[#f1f0f7] selection:bg-pink-500 selection:text-white relative">
      <Navigation />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-900/15 via-pink-600/5 to-transparent blur-3xl pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#251b46] animate-slide-up-1">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/25 text-pink-300 text-xs font-semibold shadow-inner">
              <Code2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>SakuraAPI Official REST API Documentation (v1.0)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              ឯកសារបច្ចេកទេស API សម្រាប់ Developer
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              មគ្គុទ្ទេសក៍សមាហរណកម្ម (Integration) សម្រាប់ភ្ជាប់ប្រព័ន្ធ Top-up ហ្គេមស្វ័យប្រវត្តិតាមរយៈ RESTful API ទៅកាន់ Website, Discord Bot, ឬ Telegram Bot របស់អ្នកយ៉ាងងាយស្រួល។
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <a
              href="https://sakuraapi.lol/api/docs"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-[#171032] hover:bg-[#251a50] border border-[#3b2a6e] text-purple-300 hover:text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <span>Swagger UI (សាកល្បង Live)</span>
              <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
            </a>

            <Link
              href="/api-access"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-pink-600/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>ទទួលយក API Key</span>
            </Link>
          </div>
        </div>

        {/* Global Architecture Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-slide-up-2">
          <div className="p-4 rounded-2xl bg-[#120d26]/80 border border-[#271d4a] shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <Server className="w-4 h-4 text-purple-400" />
              <span>Base URL</span>
            </div>
            <div className="font-mono text-xs text-pink-300 font-semibold mt-1 truncate">
              https://sakuraapi.lol/api/v1
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#120d26]/80 border border-[#271d4a] shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>ល្បឿនបញ្ចូល</span>
            </div>
            <div className="text-sm font-extrabold text-white mt-1">
              &lt; 3.0 វិនាទី (Instant Auto)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#120d26]/80 border border-[#271d4a] shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>សុវត្ថិភាពទិន្នន័យ</span>
            </div>
            <div className="text-sm font-extrabold text-emerald-400 mt-1">
              SHA-256 Bearer Token
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#120d26]/80 border border-[#271d4a] shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Rate Limit</span>
            </div>
            <div className="text-sm font-extrabold text-white mt-1">
              100 Requests / នាទី
            </div>
          </div>
        </div>

        {/* Language Tabs Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#120d26]/90 backdrop-blur-md border border-[#2b2052] rounded-2xl p-2.5 sm:px-4 shadow-xl animate-slide-up-2">
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
            <Terminal className="w-4 h-4 text-pink-400" />
            <span>ជ្រើសរើសភាសាកូដគំរូ (Code Language):</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'curl', label: 'cURL', badge: 'CLI / Shell' },
              { id: 'js', label: 'Node.js', badge: 'Axios / Fetch' },
              { id: 'php', label: 'PHP', badge: 'cURL' },
              { id: 'python', label: 'Python', badge: 'Requests' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveLang(lang.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  activeLang === lang.id
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                    : 'bg-[#181135] text-zinc-400 hover:text-white hover:bg-[#23184d]'
                }`}
              >
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout (Sidebar & Endpoints) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up-3">
          {/* Left Quick Navigation (Sticky on Desktop) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="sticky top-20 bg-[#120d26]/80 backdrop-blur-xl border border-[#2b2052] rounded-3xl p-4 shadow-xl space-y-1.5">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                បញ្ជីមាតិកា (Navigation)
              </div>
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                      activeSection === item.id
                        ? 'bg-pink-600/20 text-pink-300 border border-pink-500/30'
                        : 'text-zinc-400 hover:text-white hover:bg-[#1a1238]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Detailed Endpoints Documentation */}
          <div className="lg:col-span-9 space-y-8">
            {/* 1. Quickstart Section */}
            <section id="quickstart" className="bg-[#120d26]/90 border border-[#2b2052] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 hover:border-pink-500/40 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5">
                  <div className="w-full h-full bg-[#0d091e] rounded-[14px] flex items-center justify-center text-pink-300 font-bold text-sm">
                    ១
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">ដំណើរការទូទៅ (How SakuraAPI Works)</h2>
                  <p className="text-xs text-zinc-400">របៀបដំណើរការប្រព័ន្ធ Top-up ហ្គេមស្វ័យប្រវត្តិតាមរយៈ API</p>
                </div>
              </div>

              <div className="text-xs text-zinc-300 space-y-2 leading-relaxed pt-2">
                <p>
                  SakuraAPI ផ្ដល់ជូននូវ Gateway សម្រាប់តំណាងចែកចាយ (Resellers) ធ្វើការកុម្ម៉ង់បញ្ចូលពេជ្រ និង UC ទៅក្នុងគណនីអតិថិជនដោយស្វ័យប្រវត្តិតាមរយៈ HTTP REST requests 100% គ្មានការរង់ចាំដោយដៃ។
                </p>
                <div className="p-4 rounded-2xl bg-[#171032]/80 border border-[#291f4a] space-y-2">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ជំហានទាំង ៣ ដើម្បីចាប់ផ្ដើមសមាហរណកម្ម (Integration Steps)៖</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 pl-1">
                    <li><strong>បង្កើត API Key៖</strong> ចូលទៅកាន់ទំព័រ <Link href="/api-access" className="text-pink-400 hover:underline">API Access</Link> ដើម្បីបង្កើត Production Live API Key ផ្ទាល់ខ្លួន។</li>
                    <li><strong>ផ្ទៀងផ្ទាត់ Player ID៖</strong> ហៅ Endpoint <code className="text-purple-300 font-mono">POST /api/v1/games/check-id</code> ដើម្បីបញ្ជាក់ឈ្មោះ In-game Name របស់អតិថិជន។</li>
                    <li><strong>បង្កើត Order Top-up៖</strong> ហៅ Endpoint <code className="text-purple-300 font-mono">POST /api/v1/orders</code> ដើម្បីកាត់ទឹកប្រាក់ក្នុងកាបូប និងបញ្ជូនពេជ្រចូលភ្លាមៗ។</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* 2. Authentication Section */}
            <section id="auth" className="bg-[#120d26]/90 border border-[#2b2052] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 hover:border-pink-500/40 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5">
                  <div className="w-full h-full bg-[#0d091e] rounded-[14px] flex items-center justify-center text-pink-300 font-bold text-sm">
                    ២
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">ការផ្ទៀងផ្ទាត់សិទ្ធិ (Authentication)</h2>
                  <p className="text-xs text-zinc-400">ប្រើប្រាស់ Bearer Token ក្នុង HTTP Header លើគ្រប់ API Requests</p>
                </div>
              </div>

              <div className="text-xs text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  រាល់ API Request ទាំងអស់ដែលផ្ញើមកកាន់ SakuraAPI ត្រូវតែភ្ជាប់មកជាមួយ API Key របស់អ្នកនៅក្នុង HTTP Header <code className="text-pink-300 font-mono">Authorization</code>៖
                </p>

                <div className="p-3.5 rounded-2xl bg-[#090614] border border-[#251b46] font-mono text-xs text-purple-300 flex items-center justify-between">
                  <span>Authorization: Bearer sk_live_your_api_key_here</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-sans font-bold">Standard Header</span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-white">កូដគំរូពិនិត្យគណនី Reseller ({activeLang})៖</span>
                    <button
                      onClick={() => copyCode('auth', getExampleCode('auth'))}
                      className="hover:text-white transition flex items-center gap-1 text-pink-400 text-xs font-medium"
                    >
                      {copiedSection === 'auth' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'auth' ? 'បានចម្លង' : 'ចម្លងកូដ (Copy)'}</span>
                    </button>
                  </div>
                  <pre className="bg-[#090614] border border-[#251b46] rounded-2xl p-4 font-mono text-xs text-purple-200 overflow-x-auto">
                    {getExampleCode('auth')}
                  </pre>
                </div>
              </div>
            </section>

            {/* 3. Check Game ID Endpoint */}
            <section id="check-id" className="bg-[#120d26]/90 border border-[#2b2052] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 hover:border-pink-500/40 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#231844]">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                    POST
                  </span>
                  <span className="font-mono text-white font-bold text-sm sm:text-base">
                    /api/v1/games/check-id
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Auto Username Validator
                </span>
              </div>

              <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
                <p>
                  ប្រើប្រាស់ Endpoint នេះដើម្បីឆែកស្វែងរកឈ្មោះ In-game Name របស់តួអង្គហ្គេម មុនពេលអតិថិជនចុចទិញ ដើម្បីកាត់បន្ថយបញ្ហាក្នុងការវាយខុស ID ឬ Server ID។
                </p>

                {/* Parameters Table */}
                <div className="pt-2">
                  <div className="text-xs font-bold text-white mb-2">ប៉ារ៉ាម៉ែត្រក្នុង Request Body (JSON)៖</div>
                  <div className="overflow-x-auto rounded-2xl border border-[#251b46]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0e0920] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#251b46]">
                        <tr>
                          <th className="py-2.5 px-3">Field</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Required</th>
                          <th className="py-2.5 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e153b] font-mono text-[11px]">
                        <tr>
                          <td className="py-2.5 px-3 text-pink-400">game</td>
                          <td className="py-2.5 px-3 text-zinc-400">string</td>
                          <td className="py-2.5 px-3 text-emerald-400">Yes</td>
                          <td className="py-2.5 px-3 text-zinc-300 font-sans">កូដសម្គាល់ហ្គេម (ឧ. <code className="text-purple-300 font-mono">mobile-legends</code>, <code className="text-purple-300 font-mono">free-fire</code>)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 text-pink-400">userid</td>
                          <td className="py-2.5 px-3 text-zinc-400">string</td>
                          <td className="py-2.5 px-3 text-emerald-400">Yes</td>
                          <td className="py-2.5 px-3 text-zinc-300 font-sans">Player ID ឬ User ID របស់អ្នកលេង</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 text-pink-400">serverid</td>
                          <td className="py-2.5 px-3 text-zinc-400">string</td>
                          <td className="py-2.5 px-3 text-amber-400">Optional</td>
                          <td className="py-2.5 px-3 text-zinc-300 font-sans">Zone ID (តម្រូវការចាំបាច់សម្រាប់តែ Mobile Legends និង Genshin)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Code Sample */}
                <div className="space-y-2 pt-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-white">កូដគំរូ Request ({activeLang})៖</span>
                    <button
                      onClick={() => copyCode('check-id', getExampleCode('check-id'))}
                      className="hover:text-white transition flex items-center gap-1 text-pink-400 text-xs font-medium"
                    >
                      {copiedSection === 'check-id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'check-id' ? 'បានចម្លង' : 'ចម្លងកូដ (Copy)'}</span>
                    </button>
                  </div>
                  <pre className="bg-[#090614] border border-[#251b46] rounded-2xl p-4 font-mono text-xs text-purple-200 overflow-x-auto">
                    {getExampleCode('check-id')}
                  </pre>
                </div>

                {/* Response Sample */}
                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-emerald-400">ការឆ្លើយតបជោគជ័យ (HTTP 200 OK)៖</span>
                  <pre className="bg-[#090614] border border-[#251b46] rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
{`{
  "success": true,
  "data": {
    "valid": true,
    "username": "SakuraMaster99",
    "region": "Cambodia (Asia)",
    "gameTitle": "Mobile Legends: Bang Bang",
    "userId": "1473883595",
    "serverId": "14309",
    "message": "Player ID verified successfully"
  }
}`}
                  </pre>
                </div>
              </div>
            </section>

            {/* 4. Create Order Endpoint */}
            <section id="orders" className="bg-[#120d26]/90 border border-[#2b2052] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 hover:border-pink-500/40 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#231844]">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-400 font-mono font-bold text-xs border border-pink-500/30">
                    POST
                  </span>
                  <span className="font-mono text-white font-bold text-sm sm:text-base">
                    /api/v1/orders
                  </span>
                </div>
                <span className="text-xs text-pink-400 font-semibold bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20">
                  Instant Top-up Gateway
                </span>
              </div>

              <div className="text-xs text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  បង្កើត Order បញ្ចូលពេជ្រដោយស្វ័យប្រវត្តិ។ ប្រព័ន្ធនឹងកាត់ទឹកប្រាក់ក្នុងកាបូប Reseller Balance ភ្លាមៗ និងផ្ញើការបញ្ចូលទៅ Provider ក្នុងរយៈពេលក្រោម 3 វិនាទី។ ប្រសិនបើតួអង្គមិនត្រឹមត្រូវ ប្រព័ន្ធនឹង <strong>Auto-Refund</strong> បង្វិលលុយចូលគណនីវិញភ្លាមៗ 100%។
                </p>

                {/* Parameters Table */}
                <div className="overflow-x-auto rounded-2xl border border-[#251b46]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e0920] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#251b46]">
                      <tr>
                        <th className="py-2.5 px-3">Field</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Required</th>
                        <th className="py-2.5 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e153b] font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-3 text-pink-400">game</td>
                        <td className="py-2.5 px-3 text-zinc-400">string</td>
                        <td className="py-2.5 px-3 text-emerald-400">Yes</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">កូដហ្គេម (ឧ. <code className="text-purple-300 font-mono">mobile-legends</code>)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-pink-400">product_code</td>
                        <td className="py-2.5 px-3 text-zinc-400">string</td>
                        <td className="py-2.5 px-3 text-emerald-400">Yes</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">កូដកញ្ចប់ពេជ្រ (ឧ. <code className="text-purple-300 font-mono">mlbb-86</code>)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-pink-400">userid</td>
                        <td className="py-2.5 px-3 text-zinc-400">string</td>
                        <td className="py-2.5 px-3 text-emerald-400">Yes</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">Player ID របស់អតិថិជន</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-pink-400">serverid</td>
                        <td className="py-2.5 px-3 text-zinc-400">string</td>
                        <td className="py-2.5 px-3 text-amber-400">Optional</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">Zone ID (សម្រាប់ MLBB / Genshin)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-pink-400">reseller_order_id</td>
                        <td className="py-2.5 px-3 text-zinc-400">string</td>
                        <td className="py-2.5 px-3 text-emerald-400">Yes</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">លេខសម្គាល់ Order ផ្ទាល់ខ្លួនរបស់អ្នក (ការពារការបញ្ជាទិញស្ទួន Idempotency)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Code Sample */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-white">កូដគំរូ Request ({activeLang})៖</span>
                    <button
                      onClick={() => copyCode('create-order', getExampleCode('create-order'))}
                      className="hover:text-white transition flex items-center gap-1 text-pink-400 text-xs font-medium"
                    >
                      {copiedSection === 'create-order' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'create-order' ? 'បានចម្លង' : 'ចម្លងកូដ (Copy)'}</span>
                    </button>
                  </div>
                  <pre className="bg-[#090614] border border-[#251b46] rounded-2xl p-4 font-mono text-xs text-purple-200 overflow-x-auto">
                    {getExampleCode('create-order')}
                  </pre>
                </div>

                {/* Response Sample */}
                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-emerald-400">ការឆ្លើយតបជោគជ័យ (HTTP 201 Created)៖</span>
                  <pre className="bg-[#090614] border border-[#251b46] rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
{`{
  "success": true,
  "data": {
    "order_id": "SK-20260930-8849",
    "reseller_order_id": "ORD-20260930-001",
    "game": "Mobile Legends: Bang Bang",
    "product": "86 Diamonds",
    "amount": "1.45",
    "currency": "USD",
    "status": "SUCCESS",
    "created_at": "2026-09-30T12:00:00.000Z"
  }
}`}
                  </pre>
                </div>
              </div>
            </section>

            {/* 5. Games Catalog Endpoint */}
            <section id="games" className="bg-[#120d26]/90 border border-[#2b2052] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 hover:border-pink-500/40 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#231844]">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 font-mono font-bold text-xs border border-sky-500/30">
                    GET
                  </span>
                  <span className="font-mono text-white font-bold text-sm sm:text-base">
                    /api/v1/games
                  </span>
                </div>
                <span className="text-xs text-sky-400 font-semibold bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                  Live Stock & Products
                </span>
              </div>

              <div className="text-xs text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  ទាញយកបញ្ជីហ្គេម និងកញ្ចប់ពេជ្រទាំងអស់ដែលកំពុងដំណើរការ រួមទាំងតម្លៃ Reseller Cost ដើម្បីដាក់បញ្ចូលលើ Website ឬ Telegram Bot របស់អ្នកដោយស្វ័យប្រវត្តិ។
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-white">កូដគំរូ Request ({activeLang})៖</span>
                    <button
                      onClick={() => copyCode('get-games', getExampleCode('get-games'))}
                      className="hover:text-white transition flex items-center gap-1 text-pink-400 text-xs font-medium"
                    >
                      {copiedSection === 'get-games' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'get-games' ? 'បានចម្លង' : 'ចម្លងកូដ (Copy)'}</span>
                    </button>
                  </div>
                  <pre className="bg-[#090614] border border-[#251b46] rounded-2xl p-4 font-mono text-xs text-purple-200 overflow-x-auto">
                    {getExampleCode('get-games')}
                  </pre>
                </div>
              </div>
            </section>

            {/* 6. Standard Error Responses Dictionary */}
            <section id="errors" className="bg-[#120d26]/90 border border-[#2b2052] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 hover:border-pink-500/40 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">កូដកំហុសទូទៅ (Error Codes & Responses)</h2>
                  <p className="text-xs text-zinc-400">រចនាសម្ព័ន្ធនៃកំហុសស្តង់ដារដែលប្រព័ន្ធអាចបញ្ជូនត្រឡប់មកវិញ</p>
                </div>
              </div>

              <div className="text-xs text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  SakuraAPI ប្រើប្រាស់ទម្រង់ JSON ស្តង់ដាររួមមួយសម្រាប់រាល់ Error Responses ដើម្បីងាយស្រួលចាប់ក្នុង Try/Catch block របស់អ្នក៖
                </p>

                <div className="overflow-x-auto rounded-2xl border border-[#251b46]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e0920] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#251b46]">
                      <tr>
                        <th className="py-2.5 px-3">HTTP Status</th>
                        <th className="py-2.5 px-3">Error Code</th>
                        <th className="py-2.5 px-3">មូលហេតុ & ដំណោះស្រាយ (Khmer Explanation)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e153b] font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-3 text-red-400">401 Unauthorized</td>
                        <td className="py-2.5 px-3 text-purple-300">INVALID_API_KEY</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">API Key មិនត្រឹមត្រូវ ផុតកំណត់ ឬត្រូវបានលុបចោល (Revoked)។</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-amber-400">402 Payment Required</td>
                        <td className="py-2.5 px-3 text-purple-300">INSUFFICIENT_BALANCE</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">សមតុល្យក្នុងកាបូប Reseller មិនគ្រប់គ្រាន់សម្រាប់កុម្ម៉ង់កញ្ចប់នេះឡើយ។ សូមបញ្ចូលសមតុល្យបន្ថែម។</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-amber-400">409 Conflict</td>
                        <td className="py-2.5 px-3 text-purple-300">DUPLICATE_ORDER</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">លេខសម្គាល់ <code className="text-purple-300">reseller_order_id</code> នេះត្រូវបានដំណើរការរួចរាល់ហើយ មិនអាចបញ្ជូនស្ទួនបានទេ។</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-red-400">429 Too Many Requests</td>
                        <td className="py-2.5 px-3 text-purple-300">RATE_LIMITED</td>
                        <td className="py-2.5 px-3 text-zinc-300 font-sans">ចំនួន Requests លើសពីកូតាកំណត់ 100 requests / នាទី។ សូមពន្យារពេលបន្តិចមុនហៅម្ដងទៀត។</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
