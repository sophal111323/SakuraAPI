'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import {
  BookOpen,
  Copy,
  Check,
  Terminal,
  Code,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Layers,
  Zap,
  AlertCircle
} from 'lucide-react';

export default function ApiDocsPage() {
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'php' | 'python'>('curl');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getExampleCode = (endpoint: string) => {
    switch (endpoint) {
      case 'create-order':
        if (activeLang === 'curl') {
          return `curl -X POST https://sakuraapi.lol/api/v1/orders \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game": "mobile-legends",
    "product": "mlbb-86",
    "player_id": "12345678",
    "server_id": "1234",
    "reseller_order_id": "ORDER-1001"
  }'`;
        }
        if (activeLang === 'js') {
          return `const axios = require('axios');

async function createOrder() {
  const response = await axios.post('https://sakuraapi.lol/api/v1/orders', {
    game: 'mobile-legends',
    product: 'mlbb-86',
    player_id: '12345678',
    server_id: '1234',
    reseller_order_id: 'ORDER-1001'
  }, {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });

  console.log(response.data);
}`;
        }
        if (activeLang === 'php') {
          return `<?php
$apiKey = "YOUR_API_KEY";
$data = [
    "game" => "mobile-legends",
    "product" => "mlbb-86",
    "player_id" => "12345678",
    "server_id" => "1234",
    "reseller_order_id" => "ORDER-1001"
];

$ch = curl_init("https://sakuraapi.lol/api/v1/orders");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $apiKey,
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
        }
        return `import requests

url = "https://sakuraapi.lol/api/v1/orders"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "game": "mobile-legends",
    "product": "mlbb-86",
    "player_id": "12345678",
    "server_id": "1234",
    "reseller_order_id": "ORDER-1001"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

      case 'get-games':
        if (activeLang === 'curl') {
          return `curl -X GET https://sakuraapi.lol/api/v1/games \\
  -H "Authorization: Bearer YOUR_API_KEY"`;
        }
        if (activeLang === 'js') {
          return `const axios = require('axios');
const res = await axios.get('https://sakuraapi.lol/api/v1/games', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
console.log(res.data);`;
        }
        if (activeLang === 'php') {
          return `<?php
$ch = curl_init("https://sakuraapi.lol/api/v1/games");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer YOUR_API_KEY"]);
$res = curl_exec($ch);
echo $res;`;
        }
        return `import requests
res = requests.get("https://sakuraapi.lol/api/v1/games", headers={"Authorization": "Bearer YOUR_API_KEY"})
print(res.json())`;

      case 'check-id':
        if (activeLang === 'curl') {
          return `curl -X POST https://sakuraapi.lol/api/v1/games/check-id \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game": "mobile-legends",
    "userid": "12345678",
    "serverid": "1234"
  }'`;
        }
        if (activeLang === 'js') {
          return `const axios = require('axios');

async function checkGameId() {
  const response = await axios.post('https://sakuraapi.lol/api/v1/games/check-id', {
    game: 'mobile-legends',
    userid: '12345678',
    serverid: '1234'
  }, {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });

  console.log(response.data);
}`;
        }
        if (activeLang === 'php') {
          return `<?php
$apiKey = "YOUR_API_KEY";
$data = [
    "game" => "mobile-legends",
    "userid" => "12345678",
    "serverid" => "1234"
];

$ch = curl_init("https://sakuraapi.lol/api/v1/games/check-id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $apiKey,
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
        }
        return `import requests

url = "https://sakuraapi.lol/api/v1/games/check-id"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "game": "mobile-legends",
    "userid": "12345678",
    "serverid": "1234"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400" />
              <span>SakuraAPI Developer Reference</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Public Open API specifications for automated game top-up integration.
            </p>
          </div>

          <a
            href="https://sakuraapi.lol/api/docs"
            target="_blank"
            rel="noreferrer"
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-md shadow-purple-600/30 flex items-center gap-1.5"
          >
            <span>Interactive Swagger UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Language Tabs */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-xl p-2 flex items-center gap-2 w-fit">
          <span className="text-xs text-zinc-400 px-2 font-medium">Code Examples:</span>
          {(['curl', 'js', 'php', 'python'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-medium uppercase transition ${
                activeLang === lang
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1b1538]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Section 1: Authentication */}
        <section className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs">1</span>
            <span>Authentication</span>
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            All API requests must include your live API key in the standard HTTP <code className="text-purple-300 font-mono">Authorization</code> header:
          </p>
          <div className="bg-[#0b0914] border border-[#231b40] rounded-xl p-3 font-mono text-xs text-purple-300">
            Authorization: Bearer sk_live_your_secret_key_here
          </div>
        </section>

        {/* Section 2: Create Order */}
        <section className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#221c3b]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                POST
              </span>
              <span className="font-mono text-white font-semibold text-sm">/api/v1/orders</span>
            </div>
            <span className="text-xs text-zinc-400">Create automated top-up order</span>
          </div>

          <p className="text-xs text-zinc-300">
            Deducts balance atomically and sends immediate fulfillment to upstream stock provider. Duplicate <code className="text-purple-300 font-mono">reseller_order_id</code> requests will be rejected safely.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium">Request Payload Example:</span>
              <button
                onClick={() => copyCode('create-order', getExampleCode('create-order'))}
                className="hover:text-white transition flex items-center gap-1"
              >
                {copiedSection === 'create-order' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'create-order' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="bg-[#0b0914] border border-[#231b40] rounded-xl p-4 font-mono text-xs text-purple-200 overflow-x-auto">
              {getExampleCode('create-order')}
            </pre>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-zinc-400">Response Example (HTTP 201 Created):</span>
            <pre className="bg-[#0b0914] border border-[#231b40] rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
{`{
  "success": true,
  "data": {
    "order_id": "SK-2026-0001",
    "reseller_order_id": "ORDER-1001",
    "status": "PENDING",
    "amount": "1.45",
    "currency": "USD"
  },
  "timestamp": "2026-09-29T14:40:00.000Z"
}`}
            </pre>
          </div>
        </section>

        {/* Section 3: Catalog Endpoints */}
        <section className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#221c3b]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-xs">
                GET
              </span>
              <span className="font-mono text-white font-semibold text-sm">/api/v1/games</span>
            </div>
            <span className="text-xs text-zinc-400">List available game categories</span>
          </div>

          <pre className="bg-[#0b0914] border border-[#231b40] rounded-xl p-4 font-mono text-xs text-purple-200 overflow-x-auto">
            {getExampleCode('get-games')}
          </pre>
        </section>

        {/* Section 4: Game Player ID Verification (Bay2Game Gateway) */}
        <section className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#221c3b]">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-mono font-bold text-xs">
                POST
              </span>
              <span className="font-mono text-white font-semibold text-sm">/api/v1/games/check-id</span>
            </div>
            <span className="text-xs text-zinc-400">
              Verify In-game Name & Account via Upstream Bay2Game
            </span>
          </div>

          <div className="text-xs text-zinc-300 space-y-1 leading-relaxed">
            <p>
              Downstream resellers call this endpoint using their SakuraAPI Key (<code className="text-purple-300">Bearer sk_live_...</code>). SakuraAPI acts as the gateway to validate and query upstream Bay2Game validator servers.
            </p>
            <div className="text-[11px] text-zinc-400 font-mono pt-1">
              Flow: Reseller ➔ SakuraAPI (Bearer Token) ➔ Bay2Game Gateway ➔ Validated Player Response
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Request Example ({activeLang}):</span>
              <button
                onClick={() => copyCode('check-id', getExampleCode('check-id'))}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition text-[11px]"
              >
                {copiedSection === 'check-id' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'check-id' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-[#0b0914] border border-[#231b40] rounded-xl p-4 font-mono text-xs text-purple-200 overflow-x-auto">
              {getExampleCode('check-id')}
            </pre>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-zinc-400">Verified Success Response:</span>
            <pre className="bg-[#0b0914] border border-[#231b40] rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
{`{
  "valid": true,
  "username": "SakuraPro99",
  "region": "Asia",
  "gameTitle": "Mobile Legends",
  "gameCode": "mlbb",
  "userId": "12345678",
  "serverId": "1234",
  "message": "Player ID verified successfully"
}`}
            </pre>
          </div>
        </section>

        {/* Section 5: Standard Error Codes Dictionary */}
        <section className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span>Standard Error Responses</span>
          </h2>
          <p className="text-xs text-zinc-400">
            SakuraAPI returns uniform error payloads across all endpoints:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0914] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#221c3b]">
                <tr>
                  <th className="py-2.5 px-3">HTTP Status</th>
                  <th className="py-2.5 px-3">Error Code</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1738] font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 text-red-400">401 Unauthorized</td>
                  <td className="py-2.5 px-3 text-purple-300">INVALID_API_KEY</td>
                  <td className="py-2.5 px-3 text-zinc-400 font-sans">API key is missing, invalid, or revoked</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-amber-400">402 Payment Required</td>
                  <td className="py-2.5 px-3 text-purple-300">INSUFFICIENT_BALANCE</td>
                  <td className="py-2.5 px-3 text-zinc-400 font-sans">Reseller account balance is lower than the order price</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-amber-400">409 Conflict</td>
                  <td className="py-2.5 px-3 text-purple-300">DUPLICATE_ORDER</td>
                  <td className="py-2.5 px-3 text-zinc-400 font-sans">reseller_order_id has already been processed</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-red-400">429 Too Many Requests</td>
                  <td className="py-2.5 px-3 text-purple-300">RATE_LIMITED</td>
                  <td className="py-2.5 px-3 text-zinc-400 font-sans">Exceeded 100 requests per minute quota</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
