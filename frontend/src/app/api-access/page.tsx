'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
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
  ExternalLink
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
        // Fallback demo keys if not logged in
        setKeys([
          {
            id: 'k-1',
            name: 'Demo Reseller Key (Preview)',
            keyPrefix: 'sk_live_demo123...',
            environment: 'LIVE',
            status: 'ACTIVE',
            rateLimitPerMinute: 100,
            createdAt: new Date().toISOString(),
          },
        ]);
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
        throw new Error('សូមចូលគណនីតាម Telegram ជាមុនសិន ដើម្បីបង្កើត API Key។');
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
        throw new Error(json.error?.message || json.message || 'Failed to generate key');
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
    if (!confirm('Are you sure you want to revoke this API key? Requests using it will immediately fail.')) {
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
    // Real-time polling every 4 seconds
    const interval = setInterval(() => {
      fetchKeys(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>API Credentials & Access</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                  SHA-256 Hashed
                </span>
              </h1>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Sync (4s)</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Authenticate automated reseller orders programmatically using Bearer API keys.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New API Key</span>
          </button>
        </div>

        {/* Guest Banner */}
        {!user && (
          <div className="bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-purple-950/60 border border-purple-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold shrink-0">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">ចូលគណនីដើម្បីគ្រប់គ្រង API Key</h3>
                <p className="text-[11px] text-zinc-400">សូមចូលគណនីតាម Telegram ដើម្បីបង្កើត SHA-256 Bearer API Key ផ្ទាល់ខ្លួន។</p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ចូលគណនីតាម Telegram</span>
            </Link>
          </div>
        )}

        {/* Security Architecture Callout */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Zero Raw Storage</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Keys are hashed with SHA-256 upon generation. Full secrets are only shown to you once.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Rate Limit Protection</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Each key is allocated 100 requests per minute with sliding-window protection.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">HTTP Bearer Header</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Pass in headers: <code className="text-purple-300 font-mono">Authorization: Bearer sk_live_...</code>
              </p>
            </div>
          </div>
        </div>

        {/* Keys Table */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl overflow-hidden shadow-xl animate-slide-up-3">
          <div className="p-4 border-b border-[#221c3b] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Active API Keys</h2>
            <Link
              href="/docs"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition"
            >
              <span>Explore API Documentation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#100d1e] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#221c3b]">
                <tr>
                  <th className="py-3 px-4">Key Name</th>
                  <th className="py-3 px-4">Key Prefix</th>
                  <th className="py-3 px-4">Environment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Rate Limit</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1738]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                        <span>Loading API key credentials...</span>
                      </div>
                    </td>
                  </tr>
                ) : keys.length > 0 ? (
                  keys.map((k) => (
                    <tr key={k.id} className="hover:bg-[#181330] transition">
                      <td className="py-3.5 px-4 font-semibold text-white">{k.name}</td>
                      <td className="py-3.5 px-4 font-mono text-purple-300">{k.keyPrefix}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            k.environment === 'LIVE'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-zinc-700/50 text-zinc-300'
                          }`}
                        >
                          {k.environment}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            k.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {k.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {k.rateLimitPerMinute} req/min
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                        {new Date(k.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {k.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs transition inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No API keys generated yet. Click "Generate New API Key" above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Generate Key */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#120e24] border border-[#2b2252] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#221c3b]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>Generate Reseller API Key</span>
                </h3>
                <button
                  onClick={() => {
                    setCreateModalOpen(false);
                    setNewlyCreatedKey(null);
                  }}
                  className="p-1 rounded-lg hover:bg-[#201844] text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {newlyCreatedKey ? (
                /* Reveal Key Section */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Important:</strong> Copy your key now. For your security, this complete secret key will <strong>never</strong> be shown again.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Your New API Key:</label>
                    <div className="flex items-center gap-2 bg-[#0b0914] border border-purple-500/40 rounded-xl p-2.5">
                      <code className="text-xs text-purple-300 font-mono break-all flex-1 select-all">
                        {newlyCreatedKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(newlyCreatedKey)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition flex items-center gap-1 shrink-0"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCreateModalOpen(false);
                      setNewlyCreatedKey(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#1b1536] hover:bg-[#261e4a] text-white text-xs font-semibold transition"
                  >
                    I have saved my key
                  </button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
                  {!user && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-purple-300">
                        សូមចូលគណនីតាម Telegram ដើម្បីទទួលបាន API Key។
                      </div>
                      <Link
                        href="/login"
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium transition shrink-0"
                      >
                        ចូលគណនី
                      </Link>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-zinc-300 font-medium mb-1.5">Key Name / Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Production Node Server"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-medium mb-1.5">Environment</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEnvironment('LIVE')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          environment === 'LIVE'
                            ? 'bg-purple-600/20 border-purple-500 text-white font-semibold'
                            : 'bg-[#0b0914] border-[#2d2454] text-zinc-400'
                        }`}
                      >
                        Live (Production)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnvironment('TEST')}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          environment === 'TEST'
                            ? 'bg-purple-600/20 border-purple-500 text-white font-semibold'
                            : 'bg-[#0b0914] border-[#2d2454] text-zinc-400'
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
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Secure Key...</span>
                        </>
                      ) : (
                        <span>Generate Key</span>
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
  );
}
