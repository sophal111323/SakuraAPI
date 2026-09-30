'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Gamepad2,
  Calendar,
  User,
  CreditCard
} from 'lucide-react';

interface OrderItem {
  id: string;
  orderNumber: string;
  resellerOrderId?: string;
  game: string;
  gameCode: string;
  gameIcon?: string;
  product: string;
  productCode: string;
  playerId: string;
  serverId?: string;
  amount: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`${apiUrl}/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setOrders(data.items || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalOrders(data.pagination.total || 0);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetail = async (orderId: string) => {
    setOrderDetailLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        const found = orders.find((o) => o.id === orderId);
        setSelectedOrder(found || null);
        setOrderDetailLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setSelectedOrder(json.data || json);
      }
    } catch {
      // Fallback
    } finally {
      setOrderDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 20000);
    return () => clearInterval(interval);
  }, [page, statusFilter, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const filterTabs = [
    { label: 'ទាំងអស់ (All)', value: 'ALL' },
    { label: 'ជោគជ័យ (Success)', value: 'SUCCESS' },
    { label: 'កំពុងដំណើរការ (Pending)', value: 'PENDING' },
    { label: 'បរាជ័យ (Failed)', value: 'FAILED' },
  ];

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
                  <Receipt className="w-5 h-5 text-pink-400" />
                  <span>ការគ្រប់គ្រងការបញ្ជាទិញ (Orders Ledger)</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {totalOrders.toLocaleString()} ប្រតិបត្តិការ
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>ផ្សាយផ្ទាល់ (Live)</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                ប្រវត្តិលម្អិតនៃការបញ្ចូលពេជ្រហ្គេមស្វ័យប្រវត្តិទាំងអស់ដែលបានបញ្ជាទិញតាមរយៈ API និង Dashboard។
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#191136] hover:bg-[#251a50] border border-[#342468] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition disabled:opacity-50 active:scale-95 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink-400' : ''}`} />
              <span>ទាញយកថ្មី</span>
            </button>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-[#0f0924] border border-[#271c47] rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {filterTabs.map((tab) => {
                const active = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setStatusFilter(tab.value);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      active
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold shadow-md shadow-pink-600/30'
                        : 'text-zinc-400 hover:text-white hover:bg-[#181135]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរក Order ID, Player ID, ឈ្មោះហ្គេម..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0b061b] border border-[#2b1f50] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#191136] hover:bg-[#251a50] border border-[#342468] text-pink-300 hover:text-white text-xs font-semibold transition shrink-0"
              >
                ស្វែងរក
              </button>
            </form>
          </div>

          {/* Orders Section */}
          <div className="bg-[#0f0924] border border-[#271c47] rounded-3xl overflow-hidden shadow-xl">
            {/* Mobile View: Cards */}
            <div className="sm:hidden divide-y divide-[#1c133a]">
              {loading ? (
                <div className="p-10 text-center text-zinc-400 flex flex-col items-center gap-2 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-pink-400" />
                  <span>កំពុងទាញយកទិន្នន័យបញ្ជាទិញ...</span>
                </div>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <div key={ord.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Gamepad2 className="w-4 h-4 text-pink-400" />
                        <span className="text-xs font-bold text-white">{ord.game}</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          ord.status === 'SUCCESS'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : ord.status === 'PENDING' || ord.status === 'PROCESSING'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {ord.status === 'SUCCESS' ? 'ជោគជ័យ' : ord.status === 'PENDING' || ord.status === 'PROCESSING' ? 'ដំណើរការ' : 'បរាជ័យ'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">{ord.product}</span>
                      <span className="font-bold text-white text-sm">${parseFloat(ord.amount).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono bg-[#0b061b] p-2 rounded-xl border border-[#21163f]">
                      <span>UID: {ord.playerId}{ord.serverId ? ` (${ord.serverId})` : ''}</span>
                      <span className="text-pink-300 truncate max-w-[120px]">{ord.orderNumber}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                      <span>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => openOrderDetail(ord.id)}
                        className="px-3 py-1 rounded-lg bg-pink-600/15 hover:bg-pink-600/25 border border-pink-500/30 text-pink-300 font-semibold text-xs transition"
                      >
                        មើលលម្អិត
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-xs text-zinc-500">
                  មិនមានទិន្នន័យបញ្ជាទិញត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ។
                </div>
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b061c] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#21163f]">
                  <tr>
                    <th className="py-3.5 px-4">លេខកូដ Order</th>
                    <th className="py-3.5 px-4">ហ្គេម (Game)</th>
                    <th className="py-3.5 px-4">កញ្ចប់ពេជ្រ / UC</th>
                    <th className="py-3.5 px-4">ព័ត៌មាន Player</th>
                    <th className="py-3.5 px-4">តម្លៃទឹកប្រាក់</th>
                    <th className="py-3.5 px-4">ស្ថានភាព</th>
                    <th className="py-3.5 px-4">កាលបរិច្ឆេទ</th>
                    <th className="py-3.5 px-4 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1236]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-pink-400" />
                          <span>កំពុងទាញយកទិន្នន័យបញ្ជាទិញ...</span>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length > 0 ? (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#150d32] transition">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-pink-300">{ord.orderNumber}</div>
                          {ord.resellerOrderId && (
                            <div className="text-[10px] text-zinc-500 font-mono">Ref: {ord.resellerOrderId}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{ord.game}</td>
                        <td className="py-3.5 px-4 text-zinc-300">{ord.product}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-white">UID: {ord.playerId}</div>
                          {ord.serverId && (
                            <div className="text-[10px] text-amber-300 font-mono">Zone: {ord.serverId}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white text-sm">
                          ${parseFloat(ord.amount).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              ord.status === 'SUCCESS'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : ord.status === 'PENDING' || ord.status === 'PROCESSING'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {ord.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                            {ord.status === 'PENDING' && <Clock className="w-3 h-3" />}
                            {ord.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                            {ord.status === 'SUCCESS'
                              ? 'ជោគជ័យ'
                              : ord.status === 'PENDING' || ord.status === 'PROCESSING'
                              ? 'ដំណើរការ'
                              : 'បរាជ័យ'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                          {new Date(ord.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openOrderDetail(ord.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#191136] hover:bg-[#251a50] border border-[#342468] text-pink-300 hover:text-white text-xs font-semibold transition inline-flex items-center gap-1 active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>មើលលម្អិត</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        មិនមានទិន្នន័យបញ្ជាទិញត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ។
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#21163f] flex items-center justify-between text-xs text-zinc-400">
                <div>
                  ទំព័រ {page} នៃ {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-[#191136] border border-[#342468] disabled:opacity-40 hover:bg-[#251a50] transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-[#191136] border border-[#342468] disabled:opacity-40 hover:bg-[#251a50] transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#120a2b] border border-[#2b1e52] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-5 border-b border-[#21163f] flex items-center justify-between bg-[#150d32]">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>ព័ត៌មានលម្អិតនៃការបញ្ជាទិញ៖</span>
                      <span className="font-mono text-pink-300">{selectedOrder.orderNumber}</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">កំណត់ត្រាផ្លូវការមិនអាចកែប្រែបាន</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  {/* Status Callout */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      selectedOrder.status === 'SUCCESS'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : selectedOrder.status === 'PENDING' || selectedOrder.status === 'PROCESSING'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedOrder.status === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {selectedOrder.status === 'PENDING' && <Clock className="w-4 h-4 text-amber-400" />}
                      {selectedOrder.status === 'FAILED' && <XCircle className="w-4 h-4 text-rose-400" />}
                      <span className="font-bold tracking-wider">
                        {selectedOrder.status === 'SUCCESS'
                          ? 'ស្ថានភាព៖ ជោគជ័យ'
                          : selectedOrder.status === 'PENDING'
                          ? 'ស្ថានភាព៖ កំពុងដំណើរការ'
                          : 'ស្ថានភាព៖ បរាជ័យ'}
                      </span>
                    </div>
                    <span className="font-extrabold text-white text-base">
                      ${parseFloat(selectedOrder.amount).toFixed(2)} USD
                    </span>
                  </div>

                  {selectedOrder.failureReason && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <div>
                        <strong>កំហុសពី Provider៖</strong> {selectedOrder.failureReason}
                      </div>
                    </div>
                  )}

                  {/* Detail Breakdown */}
                  <div className="bg-[#0b061b] rounded-2xl p-4 border border-[#21163f] space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-[#1c133a]">
                      <span className="text-zinc-400">កូដយោង Reseller Ref៖</span>
                      <span className="font-mono text-white font-medium">{selectedOrder.resellerOrderId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c133a]">
                      <span className="text-zinc-400">កូដយោង Provider Ref៖</span>
                      <span className="font-mono text-pink-300 font-medium">{selectedOrder.providerOrderId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c133a]">
                      <span className="text-zinc-400">ហ្គេម៖</span>
                      <span className="text-white font-bold">{selectedOrder.game?.name || selectedOrder.game}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c133a]">
                      <span className="text-zinc-400">កញ្ចប់ទំនិញ៖</span>
                      <span className="text-white font-semibold">{selectedOrder.product?.name || selectedOrder.product}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c133a]">
                      <span className="text-zinc-400">Player UID របស់អ្នកលេង៖</span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedOrder.playerInfo?.playerId || selectedOrder.playerId}</span>
                    </div>
                    {(selectedOrder.playerInfo?.serverId || selectedOrder.serverId) && (
                      <div className="flex justify-between py-1 border-b border-[#1c133a]">
                        <span className="text-zinc-400">Zone ID / Server ID៖</span>
                        <span className="font-mono text-amber-300 font-semibold">{selectedOrder.playerInfo?.serverId || selectedOrder.serverId}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">ពេលវេលាបញ្ជាទិញ៖</span>
                      <span className="text-zinc-300">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-[#21163f] bg-[#0d0722] text-right">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold transition shadow-md shadow-pink-600/25 active:scale-95"
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
