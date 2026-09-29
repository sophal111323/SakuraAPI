'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Key
} from 'lucide-react';

interface ResellerItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  companyName?: string;
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
  const { token } = useAuth();
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

  // Pricing Form
  const [newMarkupPct, setNewMarkupPct] = useState('5.0');
  const [newFixedMarkup, setNewFixedMarkup] = useState('0.00');

  const fetchResellers = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        setResellers([
          {
            id: 'res-demo-1',
            userId: 'usr-1',
            name: 'Demo Reseller',
            email: 'reseller@sakuraapi.com',
            companyName: 'Sakura Game Hub',
            balance: '100.0000',
            currency: 'USD',
            status: 'ACTIVE',
            pricingTier: 'DEFAULT',
            markupPercentage: '5.00',
            fixedMarkup: '0.0000',
            ordersCount: 3,
            apiKeysCount: 1,
            createdAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '15');
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`${apiUrl}/admin/resellers?${params.toString()}`, {
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        const found = resellers.find((r) => r.id === id);
        setSelectedReseller(found ? { ...found, metrics: { totalOrders: 3, totalSpent: '1.45', successfulOrders: 1 }, recentOrders: [] } : null);
        setDetailLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/admin/resellers/${id}`, {
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
    if (!confirm(`Are you sure you want to change reseller status to ${nextStatus}?`)) return;

    setActionProcessing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      const res = await fetch(`${apiUrl}/admin/resellers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        await fetchResellers();
        if (selectedReseller && selectedReseller.id === id) {
          openResellerDetail(id);
        }
      }
    } catch {
      // Fallback
    } finally {
      setActionProcessing(false);
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReseller) return;

    setActionProcessing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      const res = await fetch(`${apiUrl}/admin/resellers/${selectedReseller.id}/pricing`, {
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
        alert('Pricing rules updated successfully');
        fetchResellers();
        openResellerDetail(selectedReseller.id);
      }
    } catch {
      // Fallback
    } finally {
      setActionProcessing(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, [page, statusFilter]);

  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              <span>Reseller Accounts Management</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Inspect balances, toggle account status, and configure custom pricing markup tiers.
            </p>
          </div>

          <button
            onClick={fetchResellers}
            disabled={loading}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[#16122d] hover:bg-[#201844] border border-[#2d2454] text-xs text-zinc-300 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-2">
            {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  statusFilter === s
                    ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1b1536]'
                }`}
              >
                {s === 'ALL' ? 'All Resellers' : s}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchResellers()}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>

        {/* Resellers Table */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#100d1e] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#221c3b]">
                <tr>
                  <th className="py-3.5 px-4">Reseller Info</th>
                  <th className="py-3.5 px-4">Store / Company</th>
                  <th className="py-3.5 px-4">Available Balance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Orders</th>
                  <th className="py-3.5 px-4">Markup</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1738]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                        <span>Loading reseller directory...</span>
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
                          {r.status}
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
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openResellerDetail(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1b1536] hover:bg-[#271d50] border border-[#352963] text-purple-300 text-xs font-medium transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      No resellers found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reseller Detail & Controls Modal */}
        {selectedReseller && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#120e24] border border-[#2b2252] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-5 border-b border-[#221c3b] flex items-center justify-between bg-[#15102a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-base">
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
                      {selectedReseller.user?.email || selectedReseller.email} • {selectedReseller.companyName || 'No store name'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReseller(null)}
                  className="p-1.5 rounded-lg bg-[#1e1738] hover:bg-[#2b2050] text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs">
                {/* Balance & Performance Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#0b0914] p-3.5 rounded-xl border border-[#231b40] space-y-1">
                    <span className="text-zinc-400">Current Balance</span>
                    <div className="text-xl font-bold text-emerald-400 font-mono">
                      ${parseFloat(selectedReseller.balance || '0.00').toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-[#0b0914] p-3.5 rounded-xl border border-[#231b40] space-y-1">
                    <span className="text-zinc-400">Total Spent</span>
                    <div className="text-xl font-bold text-white font-mono">
                      ${parseFloat(selectedReseller.metrics?.totalSpent || '0.00').toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-[#0b0914] p-3.5 rounded-xl border border-[#231b40] space-y-1">
                    <span className="text-zinc-400">Orders Fulfilled</span>
                    <div className="text-xl font-bold text-white">
                      {selectedReseller.metrics?.successfulOrders || 0} / {selectedReseller.metrics?.totalOrders || 0}
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-[#171131] border border-[#2d2254] rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white">Account Status Controls</h4>
                    <p className="text-[11px] text-zinc-400">
                      {selectedReseller.status === 'ACTIVE'
                        ? 'Reseller can generate keys, fund balance, and place orders.'
                        : 'Account suspended. All API order requests and logins are blocked.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(selectedReseller.id, selectedReseller.status)}
                    disabled={actionProcessing}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                      selectedReseller.status === 'ACTIVE'
                        ? 'bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {selectedReseller.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                  </button>
                </div>

                {/* Pricing Markup Config */}
                <form onSubmit={handleSavePricing} className="bg-[#0b0914] border border-[#231b40] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-white text-xs">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Custom Reseller Pricing Rules</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">Markup Percentage (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={newMarkupPct}
                        onChange={(e) => setNewMarkupPct(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#140f28] border border-[#2d2454] text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">Fixed Markup ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newFixedMarkup}
                        onChange={(e) => setNewFixedMarkup(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#140f28] border border-[#2d2454] text-white"
                      />
                    </div>
                  </div>

                  <div className="text-right pt-1">
                    <button
                      type="submit"
                      disabled={actionProcessing}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition"
                    >
                      Save Pricing Rule
                    </button>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#221c3b] bg-[#100d1e] text-right">
                <button
                  onClick={() => setSelectedReseller(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#1e1738] hover:bg-[#2b2152] text-white font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
