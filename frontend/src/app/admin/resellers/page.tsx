'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  Wallet,
  Settings,
  ShieldAlert,
  Sliders,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Loader2,
  AlertCircle,
  Check,
  Send,
  UserCheck,
  Building,
  Mail,
  SendHorizontal
} from 'lucide-react';

interface ResellerItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  companyName?: string;
  telegram?: string;
  telegramPhotoUrl?: string;
  balance: string;
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED';
  pricingTier: string;
  markupPercentage: string;
  fixedMarkup: string;
  ordersCount: number;
  apiKeysCount: number;
  createdAt: string;
}

export default function AdminResellersPage() {
  const { token, refreshProfile } = useAuth();
  const [resellers, setResellers] = useState<ResellerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal State
  const [selectedReseller, setSelectedReseller] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Quick Balance Modal State
  const [balanceModalReseller, setBalanceModalReseller] = useState<ResellerItem | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('20.00');
  const [balanceActionType, setBalanceActionType] = useState<'ADMIN_CREDIT' | 'ADMIN_DEBIT'>('ADMIN_CREDIT');
  const [balanceNote, setBalanceNote] = useState('បញ្ចូលលុយដោយ Admin');
  const [adjustingBalance, setAdjustingBalance] = useState(false);

  // Pricing Form
  const [newMarkupPct, setNewMarkupPct] = useState('5.0');
  const [newFixedMarkup, setNewFixedMarkup] = useState('0.00');

  // Feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'https://sakuraapi.lol/api/v1';
  const getAuthToken = () => token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

  const fetchResellers = async () => {
    setLoading(true);
    try {
      const authToken = getAuthToken();
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '30');
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`${getApiUrl()}/admin/resellers?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const payload = json.data || json;
        setResellers(payload.items || []);
        if (payload.pagination) {
          setTotalPages(payload.pagination.totalPages || 1);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const openResellerDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/resellers/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const details = json.data || json;
        setSelectedReseller(details);
        setNewMarkupPct(details.markupPercentage || '0');
        setNewFixedMarkup(details.fixedMarkup || '0');
      }
    } catch {
      // Fallback
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`តើអ្នកពិតជាចង់ប្តូរស្ថានភាពគណនី Reseller ទៅជា ${nextStatus} មែនទេ?`)) return;

    setActionProcessing(true);
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/resellers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        showFeedback('success', `បានកែប្រែស្ថានភាពទៅជា ${nextStatus} ដោយជោគជ័យ`);
        await fetchResellers();
        if (selectedReseller && selectedReseller.id === id) {
          openResellerDetail(id);
        }
      } else {
        showFeedback('error', 'បរាជ័យក្នុងការកែប្រែស្ថានភាព');
      }
    } catch {
      showFeedback('error', 'មានបញ្ហាក្នុងការតភ្ជាប់');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReseller) return;

    setActionProcessing(true);
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/resellers/${selectedReseller.id}/pricing`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          markupPercentage: parseFloat(newMarkupPct),
          fixedMarkup: parseFloat(newFixedMarkup),
        }),
      });

      if (res.ok) {
        showFeedback('success', 'បានកែប្រែភាគរយ Markup តម្លៃរួចរាល់');
        fetchResellers();
        openResellerDetail(selectedReseller.id);
      } else {
        showFeedback('error', 'បរាជ័យក្នុងការរក្សាទុក Markup');
      }
    } catch {
      showFeedback('error', 'មានបញ្ហាក្នុងការតភ្ជាប់');
    } finally {
      setActionProcessing(false);
    }
  };

  // Quick Balance Adjustment
  const openBalanceModal = (reseller: ResellerItem) => {
    setBalanceModalReseller(reseller);
    setBalanceAmount('20.00');
    setBalanceActionType('ADMIN_CREDIT');
    setBalanceNote('បញ្ចូលលុយដោយ Admin (Manual Top-up)');
  };

  const handleQuickAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModalReseller) return;

    const parsedAmount = parseFloat(balanceAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showFeedback('error', 'សូមបញ្ចូលចំនួនទឹកប្រាក់ត្រឹមត្រូវ');
      return;
    }

    setAdjustingBalance(true);
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/balance/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          resellerId: balanceModalReseller.id,
          amount: parsedAmount,
          type: balanceActionType,
          note: balanceNote.trim() || 'Admin balance adjustment',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error?.message || 'បរាជ័យក្នុងការកែប្រែសមតុល្យ');
      }

      const resData = json.data || json;
      showFeedback(
        'success',
        `បាន${balanceActionType === 'ADMIN_CREDIT' ? 'បញ្ចូលលុយ' : 'កាត់លុយ'} $${parsedAmount.toFixed(2)} ទៅកាន់ ${balanceModalReseller.name} រួចរាល់! (សមតុល្យថ្មី: $${parseFloat(resData.newBalance).toFixed(2)})`
      );

      setBalanceModalReseller(null);
      await fetchResellers();
      if (selectedReseller && selectedReseller.id === balanceModalReseller.id) {
        openResellerDetail(balanceModalReseller.id);
      }
      refreshProfile();
    } catch (err: any) {
      showFeedback('error', err.message || 'មានបញ្ហាក្នុងការកែប្រែសមតុល្យ');
    } finally {
      setAdjustingBalance(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, [page, statusFilter]);

  return (
    <AuthGuard redirectTo="/register" adminOnly={true}>
      <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Feedback Toast */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xl animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                <span>គ្រប់គ្រងគណនី Reseller (Reseller Accounts)</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                ពិនិត្យសមតុល្យទឹកប្រាក់, បញ្ចូលលុយរហ័ស, បើក/ផ្អាកគណនី, និងកំណត់ភាគរយចំណេញ (Markup Pricing)
              </p>
            </div>

            <button
              onClick={fetchResellers}
              disabled={loading}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#16122d] hover:bg-[#201844] border border-[#2d2454] text-xs text-zinc-300 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
              <span>ទាញទិន្នន័យថ្មី</span>
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'ទាំងអស់ (All)' },
                { id: 'ACTIVE', label: 'សកម្ម (Active)' },
                { id: 'SUSPENDED', label: 'ផ្អាក (Suspended)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStatusFilter(s.id as any);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    statusFilter === s.id
                      ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1b1536]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ, Email, ក្រុមហ៊ុន..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchResellers()}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0b0914] border border-[#2d2454] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Resellers Mobile Card View (visible on small screens) */}
          <div className="block lg:hidden space-y-4">
            {loading ? (
              <div className="py-12 text-center text-zinc-500">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
                <span className="text-xs">កំពុងទាញទិន្នន័យ Resellers...</span>
              </div>
            ) : resellers.length > 0 ? (
              resellers.map((r) => (
                <div
                  key={r.id}
                  className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">{r.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{r.email}</div>
                      {r.companyName && (
                        <div className="text-[10px] text-purple-300 mt-0.5">{r.companyName}</div>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {r.status === 'ACTIVE' ? 'សកម្ម' : 'ផ្អាក'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e1738] text-xs">
                    <div>
                      <span className="text-zinc-500 text-[10px] block">សមតុល្យ (Balance)</span>
                      <span className="font-bold font-mono text-emerald-400 text-sm">
                        ${parseFloat(r.balance).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block">ការបញ្ជាទិញ & Markup</span>
                      <span className="text-zinc-300 text-xs">
                        {r.ordersCount} orders • +{parseFloat(r.markupPercentage).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1e1738] flex items-center gap-2">
                    <button
                      onClick={() => openBalanceModal(r)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ បញ្ចូលលុយ</span>
                    </button>
                    <button
                      onClick={() => openResellerDetail(r.id)}
                      className="py-1.5 px-3 rounded-xl bg-[#1e1738] hover:bg-[#2b2050] text-purple-300 border border-[#352963] text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>គ្រប់គ្រង</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-8 text-center text-zinc-500 text-xs">
                មិនមានទិន្នន័យ Reseller ឡើយ
              </div>
            )}
          </div>

          {/* Resellers Desktop Table View (hidden on small screens) */}
          <div className="hidden lg:block bg-[#130f26] border border-[#2b2252] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#100d1e] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#221c3b]">
                  <tr>
                    <th className="py-3.5 px-4">ព័ត៌មាន Reseller</th>
                    <th className="py-3.5 px-4">ឈ្មោះហាង / ក្រុមហ៊ុន</th>
                    <th className="py-3.5 px-4">សមតុល្យទឹកប្រាក់ (Balance)</th>
                    <th className="py-3.5 px-4">ស្ថានភាព</th>
                    <th className="py-3.5 px-4">ការកម្ម៉ង់</th>
                    <th className="py-3.5 px-4">Markup</th>
                    <th className="py-3.5 px-4">កាលបរិច្ឆេទ</th>
                    <th className="py-3.5 px-4 text-right">សកម្មភាពរហ័ស</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1738]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                          <span>កំពុងទាញទិន្នន័យ Resellers...</span>
                        </div>
                      </td>
                    </tr>
                  ) : resellers.length > 0 ? (
                    resellers.map((r) => (
                      <tr key={r.id} className="hover:bg-[#181330] transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{r.name}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{r.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300 font-medium">
                          {r.companyName || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold font-mono text-emerald-400 text-sm">
                            ${parseFloat(r.balance).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-zinc-500 ml-1">{r.currency}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              r.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {r.status === 'ACTIVE' ? 'សកម្ម' : 'ផ្អាក'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300">
                          {r.ordersCount} orders
                        </td>
                        <td className="py-3.5 px-4 text-purple-300 font-mono">
                          +{parseFloat(r.markupPercentage).toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => openBalanceModal(r)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition inline-flex items-center gap-1 shadow-sm"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ បញ្ចូលលុយ</span>
                          </button>
                          <button
                            onClick={() => openResellerDetail(r.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#1b1536] hover:bg-[#271d50] border border-[#352963] text-purple-300 text-xs font-medium transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>គ្រប់គ្រង</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        មិនមានទិន្នន័យ Reseller ត្រូវនឹងការស្វែងរកឡើយ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================= */}
          {/* MODAL: QUICK BALANCE ADJUSTMENT */}
          {/* ========================================================= */}
          {balanceModalReseller && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-[#130f26] border border-[#2b2252] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up">
                <div className="flex items-center justify-between border-b border-[#231b45] pb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="font-bold text-white text-base">កែប្រែសមតុល្យ (Balance)</h3>
                      <p className="text-[11px] text-zinc-400">សម្រាប់: {balanceModalReseller.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBalanceModalReseller(null)}
                    className="p-1.5 rounded-xl hover:bg-[#201844] text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Reseller Info Box */}
                <div className="bg-[#0b0914] border border-[#261f47] rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 block">សមតុល្យបច្ចុប្បន្ន</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      ${parseFloat(balanceModalReseller.balance).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block font-mono">{balanceModalReseller.email}</span>
                  </div>
                </div>

                <form onSubmit={handleQuickAdjustBalance} className="space-y-4 text-xs">
                  {/* Credit / Debit Toggle */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBalanceActionType('ADMIN_CREDIT')}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition flex items-center justify-center gap-1.5 ${
                        balanceActionType === 'ADMIN_CREDIT'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-[#0b0914] border-[#2d2454] text-zinc-400'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      <span>+ បញ្ចូលលុយ (Credit)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBalanceActionType('ADMIN_DEBIT')}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition flex items-center justify-center gap-1.5 ${
                        balanceActionType === 'ADMIN_DEBIT'
                          ? 'bg-red-500/20 border-red-500 text-red-300'
                          : 'bg-[#0b0914] border-[#2d2454] text-zinc-400'
                      }`}
                    >
                      <MinusCircle className="w-4 h-4 text-red-400" />
                      <span>- កាត់លុយ (Debit)</span>
                    </button>
                  </div>

                  {/* Preset Amount Chips */}
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1.5">ជ្រើសរើសចំនួនប្រាក់រហ័ស ($):</label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {['5.00', '10.00', '20.00', '50.00', '100.00', '200.00', '500.00'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setBalanceAmount(amt)}
                          className={`py-1 px-1.5 rounded-lg border text-center font-mono font-bold text-[11px] transition ${
                            balanceAmount === amt
                              ? 'bg-purple-600 text-white border-purple-500'
                              : 'bg-[#0b0914] border-[#2d2454] text-zinc-300 hover:bg-[#1a1436]'
                          }`}
                        >
                          ${parseInt(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount Input */}
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">ចំនួនទឹកប្រាក់ ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      placeholder="20.00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Reason Note */}
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">មូលហេតុ / ចំណាំ (Audit Note) *</label>
                    <input
                      type="text"
                      required
                      value={balanceNote}
                      onChange={(e) => setBalanceNote(e.target.value)}
                      placeholder="e.g. ABA Bank deposit, Telegram Support, etc."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0b0914] border border-[#2d2454] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBalanceModalReseller(null)}
                      className="px-4 py-2 rounded-xl bg-[#1a1438] hover:bg-[#251d50] text-zinc-300 font-semibold text-xs transition"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="submit"
                      disabled={adjustingBalance}
                      className={`px-5 py-2 rounded-xl font-bold text-xs text-white transition flex items-center gap-1.5 shadow-lg disabled:opacity-50 ${
                        balanceActionType === 'ADMIN_CREDIT'
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                          : 'bg-red-600 hover:bg-red-500 shadow-red-900/30'
                      }`}
                    >
                      {adjustingBalance ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{balanceActionType === 'ADMIN_CREDIT' ? 'បញ្ជាក់ការបញ្ចូលលុយ' : 'បញ្ជាក់ការកាត់លុយ'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODAL: RESELLER DETAIL & PRICING CONTROLS */}
          {/* ========================================================= */}
          {selectedReseller && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#120e24] border border-[#2b2252] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scale-up">
                {/* Modal Header */}
                <div className="p-5 border-b border-[#221c3b] flex items-center justify-between bg-[#15102a]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-base">
                      {selectedReseller.name?.charAt(0) || 'R'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{selectedReseller.name}</span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            selectedReseller.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {selectedReseller.status}
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">
                        {selectedReseller.user?.email || selectedReseller.email} • {selectedReseller.companyName || 'គ្មានឈ្មោះក្រុមហ៊ុន'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReseller(null)}
                    className="p-1.5 rounded-xl bg-[#1e1738] hover:bg-[#2b2050] text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 text-xs">
                  {/* Balance & Performance Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0b0914] p-3.5 rounded-2xl border border-[#231b40] space-y-1">
                      <span className="text-zinc-400 text-[11px]">សមតុល្យបច្ចុប្បន្ន (Balance)</span>
                      <div className="text-xl font-bold text-emerald-400 font-mono">
                        ${parseFloat(selectedReseller.balance || '0.00').toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-[#0b0914] p-3.5 rounded-2xl border border-[#231b40] space-y-1">
                      <span className="text-zinc-400 text-[11px]">ទឹកប្រាក់បានទិញសរុប (Spent)</span>
                      <div className="text-xl font-bold text-white font-mono">
                        ${parseFloat(selectedReseller.metrics?.totalSpent || '0.00').toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-[#0b0914] p-3.5 rounded-2xl border border-[#231b40] space-y-1">
                      <span className="text-zinc-400 text-[11px]">ការកម្ម៉ង់ជោគជ័យ (Orders)</span>
                      <div className="text-xl font-bold text-white">
                        {selectedReseller.metrics?.successfulOrders || 0} / {selectedReseller.metrics?.totalOrders || 0}
                      </div>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="bg-[#171131] border border-[#2d2254] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-white">ការគ្រប់គ្រងស្ថានភាពគណនី (Status Control)</h4>
                      <p className="text-[11px] text-zinc-400">
                        {selectedReseller.status === 'ACTIVE'
                          ? 'Reseller អាច Generate API Key, បញ្ចូលលុយ និងកម្ម៉ង់ទំនិញបានធម្មតា។'
                          : 'គណនីត្រូវបានផ្អាក។ ការ Login និងរាល់ API requests ត្រូវបានបិទទាំងស្រុង។'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(selectedReseller.id, selectedReseller.status)}
                      disabled={actionProcessing}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                        selectedReseller.status === 'ACTIVE'
                          ? 'bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400'
                          : 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {selectedReseller.status === 'ACTIVE' ? 'ផ្អាកគណនី (Suspend)' : 'បើកដំណើរការវិញ (Activate)'}
                    </button>
                  </div>

                  {/* Pricing Markup Config */}
                  <form onSubmit={handleSavePricing} className="bg-[#0b0914] border border-[#231b40] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 font-semibold text-white text-xs">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>កំណត់តម្លៃពិសេសសម្រាប់ Reseller នេះ (Custom Pricing Markup)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 mb-1 text-[11px]">Markup បន្ថែមជាភាគរយ (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={newMarkupPct}
                          onChange={(e) => setNewMarkupPct(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#140f28] border border-[#2d2454] text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1 text-[11px]">Fixed Markup បន្ថែមថេរ ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newFixedMarkup}
                          onChange={(e) => setNewFixedMarkup(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#140f28] border border-[#2d2454] text-white"
                        />
                      </div>
                    </div>

                    <div className="text-right pt-1">
                      <button
                        type="submit"
                        disabled={actionProcessing}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                      >
                        រក្សាទុកច្បាប់តម្លៃ (Save Pricing)
                      </button>
                    </div>
                  </form>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[#221c3b] bg-[#100d1e] text-right">
                  <button
                    onClick={() => setSelectedReseller(null)}
                    className="px-4 py-2 rounded-xl bg-[#1e1738] hover:bg-[#2b2152] text-white font-medium transition text-xs"
                  >
                    បិទផ្ទាំង (Close)
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
