'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  Key,
  Plus,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  X,
  Trash2,
  RefreshCw,
  Clock,
  Zap,
  Terminal,
  ExternalLink,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  environment: 'LIVE' | 'TEST';
  status: 'ACTIVE' | 'REVOKED';
  rateLimitPerMinute: number;
  lastUsedAt?: string;
  createdAt: string;
}

export default function ApiAccessPage() {
  const { token, user, refreshProfile } = useAuth();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [environment, setEnvironment] = useState<'LIVE' | 'TEST'>('LIVE');
  const [generating, setGenerating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        setKeys([]);
        if (!silent) setLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/api-keys`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setKeys(json.data || json);
      }
    } catch {
      // Fallback
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        throw new Error('សូមចូលគណនីជាមុនសិន ដើម្បីបង្កើត API Key។');
      }

      const res = await fetch(`${apiUrl}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: keyName || 'My API Key',
          environment,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'បរាជ័យក្នុងការបង្កើត API Key');
      }

      const created = json.data || json;
      setNewlyCreatedKey(created.fullKey);
      fetchKeys(true);
      setKeyName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបចោល API Key នេះមែនទេ? រាល់ការហៅ API ដោយប្រើ Key នេះនឹងត្រូវបរាជ័យភ្លាមៗ។')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      const res = await fetch(`${apiUrl}/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        fetchKeys(true);
      }
    } catch {
      // Fallback
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchKeys();
    const interval = setInterval(() => {
      fetchKeys(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <AuthGuard redirectTo="/register">
      <div className="min-h-screen bg-[#070414] text-white selection:bg-pink-500 selection:text-white pb-16">
        <Navigation />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-pink-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 relative z-10">
          {/* Header */}
          <div className="bg-[#100a26]/90 border border-[#261c47] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-pink-400" />
                  <span>គ្រប់គ្រងសិទ្ធិ & API Key (API Access)</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  SHA-256 សុវត្ថិភាពខ្ពស់
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>ផ្សាយផ្ទាល់ (Live)</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                ប្រើប្រាស់ Bearer API Key ដើម្បីភ្ជាប់ប្រព័ន្ធបញ្ជាទិញ Top-up ហ្គេមស្វ័យប្រវត្តិតាមរយៈ Bot, Script ឬ Website។
              </p>
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 flex items-center gap-2 transition active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ បង្កើត API Key ថ្មី</span>
            </button>
          </div>

          {/* Security Features Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0f0924] border border-[#2b1f52] shadow-lg flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">សុវត្ថិភាព គ្មានការរក្សាទុក Key ដើម</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Key ត្រូវបាន Hash ដោយ SHA-256 ពេលបង្កើត។ កូដសម្ងាត់ពេញលេញនឹងបង្ហាញជូនតែម្តងគត់។
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f0924] border border-[#2b1f52] shadow-lg flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">ការពារកម្រិត Rate Limit</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Key នីមួយៗទទួលបានកូតា 100 requests / នាទី ជាមួយប្រព័ន្ធការពារ Sliding Window។
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f0924] border border-[#2b1f52] shadow-lg flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">ទម្រង់ HTTP Bearer Header</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                  Authorization: Bearer sk_live_...
                </p>
              </div>
            </div>
          </div>

          {/* Keys Table Container */}
          <div className="bg-[#0f0924] border border-[#271c47] rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 sm:px-6 border-b border-[#21163f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-pink-400" />
                <h2 className="text-sm font-bold text-white">បញ្ជី API Keys ដែលកំពុងដំណើរការ</h2>
              </div>
              <Link
                href="/docs"
                className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition"
              >
                <span>មើលឯកសារបច្ចេកទេស (API Docs)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile View: Cards */}
            <div className="sm:hidden divide-y divide-[#1c133a]">
              {loading ? (
                <div className="p-8 text-center text-zinc-400 flex flex-col items-center gap-2 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-pink-400" />
                  <span>កំពុងទាញយកទិន្នន័យ API Key...</span>
                </div>
              ) : keys.length > 0 ? (
                keys.map((k) => (
                  <div key={k.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{k.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          k.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {k.status === 'ACTIVE' ? 'សកម្ម (Active)' : 'បានលុប (Revoked)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-pink-300">{k.keyPrefix}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        {k.environment}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span>Rate Limit: {k.rateLimitPerMinute} req/min</span>
                      {k.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-[10px] transition"
                        >
                          លុបចោល
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500">
                  មិនទាន់មាន API Key នៅឡើយទេ។ សូមចុច «+ បង្កើត API Key ថ្មី» ខាងលើ។
                </div>
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b061c] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#21163f]">
                  <tr>
                    <th className="py-3 px-4">ឈ្មោះ Key</th>
                    <th className="py-3 px-4">កូដសម្គាល់ (Prefix)</th>
                    <th className="py-3 px-4">បរិស្ថាន</th>
                    <th className="py-3 px-4">ស្ថានភាព</th>
                    <th className="py-3 px-4">កូតា Rate Limit</th>
                    <th className="py-3 px-4">កាលបរិច្ឆេទបង្កើត</th>
                    <th className="py-3 px-4 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1236]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-pink-400" />
                          <span>កំពុងទាញយកទិន្នន័យ API Key...</span>
                        </div>
                      </td>
                    </tr>
                  ) : keys.length > 0 ? (
                    keys.map((k) => (
                      <tr key={k.id} className="hover:bg-[#150d32] transition">
                        <td className="py-3.5 px-4 font-bold text-white">{k.name}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-pink-300">{k.keyPrefix}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              k.environment === 'LIVE'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/30'
                            }`}
                          >
                            {k.environment}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                              k.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {k.status === 'ACTIVE' ? 'សកម្ម (Active)' : 'បានលុបចោល'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          {k.rateLimitPerMinute} req/min
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {k.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs transition inline-flex items-center gap-1 active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>លុបចោល</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        មិនទាន់មាន API Key នៅឡើយទេ។ សូមចុច «+ បង្កើត API Key ថ្មី» ខាងលើ។
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Generate Key */}
          {createModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#120a2b] border border-[#2b1e52] rounded-3xl w-full max-w-md shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#21163f]">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-pink-400" />
                    <span>បង្កើត API Key ថ្មី (Generate Key)</span>
                  </h3>
                  <button
                    onClick={() => {
                      setCreateModalOpen(false);
                      setNewlyCreatedKey(null);
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {newlyCreatedKey ? (
                  /* Reveal Key Screen */
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <span className="leading-relaxed">
                        <strong>សំខាន់ណាស់៖</strong> សូមចម្លង Key នេះទុកឥឡូវនេះ! ដើម្បីសុវត្ថិភាព ប្រព័ន្ធនឹង <strong>មិនបង្ហាញ</strong> Key ពេញលេញនេះម្តងទៀតឡើយ។
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-medium">API Key របស់អ្នក៖</label>
                      <div className="flex items-center gap-2 bg-[#0b061b] border border-pink-500/40 rounded-xl p-2.5">
                        <code className="text-xs text-pink-300 font-mono break-all flex-1 select-all">
                          {newlyCreatedKey}
                        </code>
                        <button
                          onClick={() => copyToClipboard(newlyCreatedKey)}
                          className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'បានចម្លង' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCreateModalOpen(false);
                        setNewlyCreatedKey(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold transition"
                    >
                      ខ្ញុំបានរក្សាទុក Key នេះរួចរាល់ហើយ
                    </button>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleCreateKey} className="space-y-3.5 text-xs">
                    {error && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        ឈ្មោះសម្គាល់ Key <span className="text-zinc-500 font-normal">(ឧ. Telegram Bot, Website API)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ឧ. Production Key"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b061b] border border-[#2b1f50] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">ប្រភេទបរិស្ថាន (Environment)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setEnvironment('LIVE')}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            environment === 'LIVE'
                              ? 'bg-pink-600/20 border-pink-500 text-white font-bold'
                              : 'bg-[#0b061b] border-[#2b1f50] text-zinc-400'
                          }`}
                        >
                          Live (Production)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEnvironment('TEST')}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            environment === 'TEST'
                              ? 'bg-pink-600/20 border-pink-500 text-white font-bold'
                              : 'bg-[#0b061b] border-[#2b1f50] text-zinc-400'
                          }`}
                        >
                          Test (Sandbox)
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={generating}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md shadow-pink-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {generating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>កំពុងបង្កើត Key សុវត្ថិភាព...</span>
                          </>
                        ) : (
                          <span>+ បង្កើត API Key</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
