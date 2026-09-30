'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import {
  History,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  CreditCard,
  PlusCircle,
  QrCode,
  ExternalLink,
  Send,
  X,
  Sparkles
} from 'lucide-react';

interface Transaction {
  id: string;
  transactionNumber: string;
  amount: string;
  previousBalance: string;
  newBalance: string;
  type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'ORDER_PAYMENT' | 'ORDER_REFUND' | 'MANUAL_ADJUSTMENT';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  note?: string;
  createdAt: string;
}

export default function FundingPage() {
  const { user, reseller, token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const fetchTransactions = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        // Fallback demo transactions
        setTransactions([]);
        if (!silent) setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);

      const res = await fetch(`${apiUrl}/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setTransactions(data.items || []);
      }
    } catch {
      // Fallback
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Real-time polling every 4 seconds
    const interval = setInterval(() => {
      fetchTransactions(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [typeFilter, token]);

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'ADMIN_CREDIT':
        return { label: 'Admin Credit', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'ADMIN_DEBIT':
        return { label: 'Admin Debit', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'ORDER_PAYMENT':
        return { label: 'Order Deduction', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'ORDER_REFUND':
        return { label: 'Order Refund', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      default:
        return { label: 'Adjustment', color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' };
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Funding & Balance Ledger</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                  Immutable
                </span>
              </h1>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Ledger (4s)</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Every balance deposit, order deduction, and automated refund is permanently audited.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#130f26] border border-[#2b2252] text-xs">
              <Wallet className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-zinc-400">Current Balance:</span>
              <span className="font-bold text-white text-sm">
                ${parseFloat(reseller?.balance || '0.00').toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setDepositModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-pink-600/30 flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>បញ្ចូលសមតុល្យ (Deposit)</span>
            </button>

            <button
              onClick={() => fetchTransactions(false)}
              disabled={loading}
              className="p-2 rounded-xl bg-[#16122d] hover:bg-[#201844] border border-[#2d2454] text-zinc-300 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ledger Security Guarantee */}
        <div className="bg-[#120e24] border border-[#261f43] rounded-xl p-3.5 flex items-center justify-between gap-4 text-xs text-zinc-400 animate-slide-up-2">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All transactions executed with PostgreSQL atomic row locks. No balance update occurs without an immutable ledger row.
            </span>
          </div>
          <span className="font-mono text-purple-300 text-[11px] shrink-0 hidden sm:inline">DECIMAL(14, 4)</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 animate-slide-up-3">
          {['ALL', 'ADMIN_CREDIT', 'ORDER_PAYMENT', 'ORDER_REFUND'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                  : 'bg-[#130f26] border border-[#2b2252] text-zinc-400 hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'All Types' : t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl overflow-hidden shadow-xl animate-slide-up-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#100d1e] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#221c3b]">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Previous Balance</th>
                  <th className="py-3.5 px-4">New Balance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Note / Reason</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1738]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                        <span>Loading ledger history...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => {
                    const badge = getTypeBadge(tx.type);
                    const isCredit = parseFloat(tx.amount) > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-[#181330] transition">
                        <td className="py-3.5 px-4 font-mono font-medium text-purple-300">
                          {tx.transactionNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold font-mono text-sm ${
                              isCredit ? 'text-emerald-400' : 'text-zinc-200'
                            }`}
                          >
                            {isCredit ? `+` : ``}${parseFloat(tx.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          ${parseFloat(tx.previousBalance).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-white">
                          ${parseFloat(tx.newBalance).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tx.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-300'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300 text-[11px] max-w-xs truncate">
                          {tx.note || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal: Deposit Funds */}
        {depositModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#120e24] border border-[#2b2252] rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150 relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#221c3b]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">បញ្ចូលសមតុល្យកាបូប (Deposit Funds)</h3>
                    <p className="text-[11px] text-zinc-400">SakuraAPI Reseller Atomic Reserve</p>
                  </div>
                </div>
                <button
                  onClick={() => setDepositModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#201844] text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Method 1: ABA / Bakong KHQR */}
                <div className="p-4 rounded-2xl bg-[#16102e] border border-[#2e2254] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-pink-400" />
                      <span>ជម្រើសទី ១: ស្កេន KHQR (ABA Bank / Bakong)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      លឿនបំផុត
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    លោកអ្នកអាចផ្ទេរប្រាក់ចាប់ពី <strong className="text-pink-400">$5.00 USD</strong> ឡើងទៅតាមរយៈគណនីធនាគារ ABA ឬស្កេន KHQR គ្រប់ធនាគារក្នុងប្រទេសកម្ពុជា។
                  </p>
                  <div className="p-2.5 rounded-xl bg-[#0e0a1f] border border-[#221845] font-mono text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">ឈ្មោះគណនី:</span>
                      <span className="text-white font-semibold">SAKURA TOPUP CO., LTD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">រូបិយប័ណ្ណ:</span>
                      <span className="text-emerald-400 font-semibold">USD / KHR</span>
                    </div>
                  </div>
                </div>

                {/* Method 2: Telegram Admin Confirmation */}
                <div className="p-4 rounded-2xl bg-[#16102e] border border-[#2e2254] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-sky-400" />
                      <span>ជម្រើសទី ២: បញ្ចូលតាម Telegram Support 24/7</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                      24/7 Online
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    បន្ទាប់ពីផ្ទេររួច សូមផ្ញើវិក្កយបត្រ (Receipt) ឬ Transaction ID ទៅកាន់ Telegram Bot ផ្លូវការ ដើម្បីឱ្យ Admin បញ្ចូលសមតុល្យជូនភ្លាមៗ៖
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#0e0a1f] border border-[#221845] text-[11px] flex items-center justify-between">
                    <div>
                      <div className="text-zinc-400">លេខកូដសម្គាល់គណនីរបស់អ្នក:</div>
                      <div className="font-mono text-purple-300 font-bold">{user?.name || 'Reseller'} (ID: {reseller?.id?.slice(0, 8) || 'Active'})</div>
                    </div>
                    <a
                      href="https://t.me/Sakuraapi_bot"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1 transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>@Sakuraapi_bot</span>
                    </a>
                  </div>
                </div>

                {/* Note */}
                <div className="text-[11px] text-zinc-400 bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    សមតុល្យរបស់អ្នកត្រូវបានការពារដោយប្រព័ន្ធសុវត្ថិភាពទ្វេដង (Atomic Reserve) ធានាថាមិនបាត់បង់ប្រាក់ឡើយ។
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setDepositModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#1e1738] hover:bg-[#2b2152] text-white font-semibold text-xs transition"
                >
                  យល់ព្រម / បិទ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
