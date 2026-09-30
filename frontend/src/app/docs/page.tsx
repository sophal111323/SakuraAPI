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

type SupportedLang = 'curl' | 'termux' | 'python' | 'php' | 'js';

interface CodeBlockBoxProps {
  endpoint: string;
  activeLang: SupportedLang;
  setActiveLang: (lang: SupportedLang) => void;
  code: string;
  copyCode: (id: string, code: string) => void;
  isCopied: boolean;
}

function CodeBlockBox({
  endpoint,
  activeLang,
  setActiveLang,
  code,
  copyCode,
  isCopied
}: CodeBlockBoxProps) {
  const tabs: { id: SupportedLang; label: string }[] = [
    { id: 'curl', label: 'cURL' },
    { id: 'termux', label: 'Termux' },
    { id: 'python', label: 'Python' },
    { id: 'php', label: 'PHP' },
    { id: 'js', label: 'Node.js' }
  ];

  return (
    <div className="space-y-2 pt-2">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold tracking-widest uppercase text-amber-500/90 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          CODE EXAMPLES
        </span>
      </div>

      {/* Code Box Container */}
      <div className="bg-[#0c081e] border border-[#271d4a] rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-pink-500/35">
        {/* Top Header inside Code Box */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#130d2d] border-b border-[#231844]">
          {/* Language Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {tabs.map((tab) => {
              const active = activeLang === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLang(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30 ring-1 ring-pink-400/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={() => copyCode(endpoint, code)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-[#1a1238] hover:bg-[#251a50] border border-[#342468] transition-all active:scale-95 ml-2 shrink-0"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">បានចម្លង</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <pre className="p-4 font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed bg-[#070414] scrollbar-thin scrollbar-thumb-purple-900/50">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

interface ResponseBlockBoxProps {
  endpoint: string;
  successJson: string;
  failedJson: string;
  successBadge?: string;
  failedBadge?: string;
  copyCode: (id: string, code: string) => void;
  isCopied: boolean;
}

function ResponseBlockBox({
  endpoint,
  successJson,
  failedJson,
  successBadge = '200 OK',
  failedBadge = '400 ERROR',
  copyCode,
  isCopied
}: ResponseBlockBoxProps) {
  const [tab, setTab] = useState<'success' | 'failed'>('success');
  const activeContent = tab === 'success' ? successJson : failedJson;

  return (
    <div className="space-y-2 pt-2">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold tracking-widest uppercase text-amber-500/90 flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-amber-400" />
          EXAMPLE RESPONSE
        </span>
      </div>

      {/* Response Box Container */}
      <div className="bg-[#0c081e] border border-[#271d4a] rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-pink-500/35">
        {/* Top Header inside Response Box */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#130d2d] border-b border-[#231844]">
          {/* Status Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('success')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                tab === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${tab === 'success' ? 'block' : 'hidden'}`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Success</span>
              <span className="text-[10px] font-mono opacity-80 px-1 py-0.2 bg-emerald-500/20 rounded border border-emerald-500/30">
                {successBadge}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab('failed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                tab === 'failed'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              <span>Failed</span>
              <span className="text-[10px] font-mono opacity-80 px-1 py-0.2 bg-rose-500/20 rounded border border-rose-500/30">
                {failedBadge}
              </span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={() => copyCode(`${endpoint}-res-${tab}`, activeContent)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-[#1a1238] hover:bg-[#251a50] border border-[#342468] transition-all active:scale-95 ml-2 shrink-0"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">បានចម្លង</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* JSON Preview */}
        <pre className={`p-4 font-mono text-xs overflow-x-auto leading-relaxed bg-[#070414] scrollbar-thin scrollbar-thumb-purple-900/50 ${
          tab === 'success' ? 'text-emerald-300' : 'text-rose-300'
        }`}>
          <code>{activeContent}</code>
        </pre>
      </div>
    </div>
  );
}

const RESPONSE_MOCKS = {
  auth: {
    success: `{
  "status": "SUCCESS",
  "user": {
    "id": 1,
    "telegram_id": "8821434690",
    "username": "DemoUser",
    "balance": 98.9,
    "status": "active",
    "role": "reseller",
    "total_orders": 9,
    "total_spent": 0.65,
    "created_at": "2026-06-18 13:42:58",
    "updated_at": "2026-09-30 10:30:15"
  }
}`,
    failed: `{
  "status": "FAILED",
  "error": {
    "code": 401,
    "message": "Invalid API token or unauthorized request. Please check your Bearer token in the header."
  }
}`
  },
  checkId: {
    success: `{
  "status": "SUCCESS",
  "data": {
    "valid": true,
    "username": "SakuraMaster99",
    "region": "Cambodia (Asia)",
    "game": "mobile-legends",
    "userid": "1473883595",
    "serverid": "14309",
    "message": "Player ID verified successfully"
  }
}`,
    failed: `{
  "status": "FAILED",
  "error": {
    "code": 400,
    "message": "Player ID 1473883595 or Server ID 14309 not found. Please verify the credentials."
  }
}`
  },
  orders: {
    success: `{
  "status": "SUCCESS",
  "data": {
    "order_id": "SK-20260930-8849",
    "reseller_order_id": "ORD-20260930-001",
    "game": "mobile-legends",
    "product_code": "mlbb-86",
    "amount": 1.45,
    "currency": "USD",
    "player_id": "1473883595 (14309)",
    "status": "PROCESSING",
    "created_at": "2026-09-30T13:40:00.000Z"
  }
}`,
    failed: `{
  "status": "FAILED",
  "error": {
    "code": 402,
    "message": "Insufficient wallet balance. Current: $0.25, Required: $1.45. Please deposit funds via KHQR."
  }
}`
  },
  games: {
    success: `{
  "status": "SUCCESS",
  "count": 4,
  "data": [
    {
      "id": "mobile-legends",
      "name": "Mobile Legends: Bang Bang",
      "category": "MOBA",
      "status": "ONLINE",
      "server_required": true,
      "products_count": 18
    },
    {
      "id": "free-fire",
      "name": "Free Fire",
      "category": "Battle Royale",
      "status": "ONLINE",
      "server_required": false,
      "products_count": 14
    },
    {
      "id": "pubg-mobile",
      "name": "PUBG Mobile",
      "category": "Battle Royale",
      "status": "ONLINE",
      "server_required": false,
      "products_count": 12
    }
  ]
}`,
    failed: `{
  "status": "FAILED",
  "error": {
    "code": 503,
    "message": "Game catalog service temporarily undergoing maintenance. Please retry in 1 minute."
  }
}`
  }
};

export default function ApiDocsPage() {
  const [activeLang, setActiveLang] = useState<SupportedLang>('curl');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('quickstart');

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getExampleCode = (endpoint: string) => {
    switch (endpoint) {
      case 'auth':
        if (activeLang === 'curl') {
          return `curl -X GET "https://sakuraapi.lol/api/v1/reseller/me" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Accept: application/json"`;
        }
        if (activeLang === 'termux') {
          return `# ក្នុង Termux (សូមដំឡើង: pkg install curl jq -y)
API_KEY="sk_live_YOUR_API_KEY"

curl -s -X GET "https://sakuraapi.lol/api/v1/reseller/me" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Accept: application/json" | jq .`;
        }
        if (activeLang === 'js') {
          return `const axios = require('axios');

const res = await axios.get('https://sakuraapi.lol/api/v1/reseller/me', {
  headers: {
    'Authorization': 'Bearer sk_live_YOUR_API_KEY',
    'Accept': 'application/json'
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
    "Accept: application/json"
]);
$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
        }
        return `import requests

headers = {
    "Authorization": "Bearer sk_live_YOUR_API_KEY",
    "Accept": "application/json"
}
response = requests.get("https://sakuraapi.lol/api/v1/reseller/me", headers=headers)
print(response.json())`;

      case 'check-id':
        if (activeLang === 'curl') {
          return `curl -X POST "https://sakuraapi.lol/api/v1/games/check-id" \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game": "mobile-legends",
    "userid": "1473883595",
    "serverid": "14309"
  }'`;
        }
        if (activeLang === 'termux') {
          return `# ឆែកស្វែងរកឈ្មោះ In-game Name ក្នុង Termux
API_KEY="sk_live_YOUR_API_KEY"

curl -s -X POST "https://sakuraapi.lol/api/v1/games/check-id" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game": "mobile-legends",
    "userid": "1473883595",
    "serverid": "14309"
  }' | jq .`;
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
          return `curl -X POST "https://sakuraapi.lol/api/v1/orders" \\
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
        if (activeLang === 'termux') {
          return `# បញ្ជាទិញ Top-up ស្វ័យប្រវត្តតាម Termux Terminal
API_KEY="sk_live_YOUR_API_KEY"
ORDER_ID="ORD-$(date +%s)"

curl -s -X POST "https://sakuraapi.lol/api/v1/orders" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game": "mobile-legends",
    "product_code": "mlbb-86",
    "userid": "1473883595",
    "serverid": "14309",
    "reseller_order_id": "'"$ORDER_ID"'"
  }' | jq .`;
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
    "reseller_order_id": "ORD-20260930-001"
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
          return `curl -X GET "https://sakuraapi.lol/api/v1/games" \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Accept: application/json"`;
        }
        if (activeLang === 'termux') {
          return `# ទាញយកបញ្ជីហ្គេម & ស្តុកទំនិញក្នុង Termux
API_KEY="sk_live_YOUR_API_KEY"

curl -s -X GET "https://sakuraapi.lol/api/v1/games" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Accept: application/json" | jq .`;
        }
        if (activeLang === 'js') {
          return `const axios = require('axios');

const res = await axios.get('https://sakuraapi.lol/api/v1/games', {
  headers: { 
    'Authorization': 'Bearer sk_live_YOUR_API_KEY',
    'Accept': 'application/json'
  }
});
console.log(res.data);`;
        }
        if (activeLang === 'php') {
          return `<?php
$ch = curl_init("https://sakuraapi.lol/api/v1/games");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer sk_live_YOUR_API_KEY",
    "Accept: application/json"
]);
$res = curl_exec($ch);
curl_close($ch);
echo $res;`;
        }
        return `import requests

headers = {
    "Authorization": "Bearer sk_live_YOUR_API_KEY",
    "Accept": "application/json"
}
res = requests.get("https://sakuraapi.lol/api/v1/games", headers=headers)
print(res.json())`;

      default:
        return '';
    }
  };

  const navLinks = [
    { id: 'quickstart', label: 'ដំណើរការទូទៅ (How It Works)', icon: Zap },
    { id: 'auth', label: 'ការផ្ទៀងផ្ទាត់សិទ្ធិ (Authentication)', icon: ShieldCheck },
    { id: 'check-id', label: 'ឆែក ID ហ្គេម (Check Game ID)', icon: UserCheck },
    { id: 'orders', label: 'បញ្ជាទិញពេជ្រ (Create Order)', icon: Receipt },
    { id: 'games', label: 'បញ្ជីហ្គេម & ស្តុក (Games Catalog)', icon: Gamepad2 },
    { id: 'errors', label: 'កូដកំហុសទូទៅ (Error Codes)', icon: AlertCircle }
  ];

  return (
    <div className="min-h-screen bg-[#070414] text-white selection:bg-pink-500 selection:text-white pb-20">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170e33] via-[#211247] to-[#120a2e] border border-[#31205c] p-6 sm:p-10 shadow-2xl animate-fade-in">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>SakuraAPI Official Documentation v1.2</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                មគ្គុទ្ទេសក៍ភ្ជាប់ <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400">REST API</span> សម្រាប់ Resellers
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                ឯកសារបច្ចេកទេស និងកូដគំរូសម្រាប់ Developer យកទៅភ្ជាប់ប្រព័ន្ធស្វ័យប្រវត្តិជាមួយ Website, Telegram Mini App, Webhook ឬ Bot យ៉ាងងាយស្រួល និងរហ័ស។
              </p>
            </div>

            <Link
              href="/api-access"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-pink-600/30 transition-all flex items-center gap-1.5 active:scale-95 shrink-0 self-start md:self-auto"
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

        {/* Global Language Quick Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#120d26]/90 backdrop-blur-md border border-[#2b2052] rounded-2xl p-2.5 sm:px-4 shadow-xl animate-slide-up-2">
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
            <Terminal className="w-4 h-4 text-pink-400" />
            <span>ជ្រើសរើសភាសាកូដគំរូទូទៅ (Default Language):</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'curl', label: 'cURL' },
              { id: 'termux', label: 'Termux' },
              { id: 'python', label: 'Python' },
              { id: 'php', label: 'PHP' },
              { id: 'js', label: 'Node.js' }
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setActiveLang(lang.id as SupportedLang)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  activeLang === lang.id
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30 ring-1 ring-pink-400/50'
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

                {/* Code Examples Box */}
                <CodeBlockBox
                  endpoint="auth"
                  activeLang={activeLang}
                  setActiveLang={setActiveLang}
                  code={getExampleCode('auth')}
                  copyCode={copyCode}
                  isCopied={copiedSection === 'auth'}
                />

                {/* Example Response Box */}
                <ResponseBlockBox
                  endpoint="auth"
                  successJson={RESPONSE_MOCKS.auth.success}
                  failedJson={RESPONSE_MOCKS.auth.failed}
                  successBadge="200 OK"
                  failedBadge="401 UNAUTHORIZED"
                  copyCode={copyCode}
                  isCopied={copiedSection?.startsWith('auth-res') ?? false}
                />
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

              <div className="text-xs text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  ប្រើប្រាស់ Endpoint នេះដើម្បីឆែកស្វែងរកឈ្មោះ In-game Name របស់តួអង្គហ្គេម មុនពេលអតិថិជនចុចទិញ ដើម្បីកាត់បន្ថយបញ្ហាក្នុងការវាយខុស ID ឬ Server ID។
                </p>

                {/* Parameters Table */}
                <div className="pt-1">
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

                {/* Code Examples Box */}
                <CodeBlockBox
                  endpoint="check-id"
                  activeLang={activeLang}
                  setActiveLang={setActiveLang}
                  code={getExampleCode('check-id')}
                  copyCode={copyCode}
                  isCopied={copiedSection === 'check-id'}
                />

                {/* Example Response Box */}
                <ResponseBlockBox
                  endpoint="check-id"
                  successJson={RESPONSE_MOCKS.checkId.success}
                  failedJson={RESPONSE_MOCKS.checkId.failed}
                  successBadge="200 OK"
                  failedBadge="400 BAD REQUEST"
                  copyCode={copyCode}
                  isCopied={copiedSection?.startsWith('check-id-res') ?? false}
                />
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

                {/* Code Examples Box */}
                <CodeBlockBox
                  endpoint="create-order"
                  activeLang={activeLang}
                  setActiveLang={setActiveLang}
                  code={getExampleCode('create-order')}
                  copyCode={copyCode}
                  isCopied={copiedSection === 'create-order'}
                />

                {/* Example Response Box */}
                <ResponseBlockBox
                  endpoint="orders"
                  successJson={RESPONSE_MOCKS.orders.success}
                  failedJson={RESPONSE_MOCKS.orders.failed}
                  successBadge="201 CREATED"
                  failedBadge="402 PAYMENT REQUIRED"
                  copyCode={copyCode}
                  isCopied={copiedSection?.startsWith('orders-res') ?? false}
                />
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

                {/* Code Examples Box */}
                <CodeBlockBox
                  endpoint="get-games"
                  activeLang={activeLang}
                  setActiveLang={setActiveLang}
                  code={getExampleCode('get-games')}
                  copyCode={copyCode}
                  isCopied={copiedSection === 'get-games'}
                />

                {/* Example Response Box */}
                <ResponseBlockBox
                  endpoint="games"
                  successJson={RESPONSE_MOCKS.games.success}
                  failedJson={RESPONSE_MOCKS.games.failed}
                  successBadge="200 OK"
                  failedBadge="503 MAINTENANCE"
                  copyCode={copyCode}
                  isCopied={copiedSection?.startsWith('games-res') ?? false}
                />
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
