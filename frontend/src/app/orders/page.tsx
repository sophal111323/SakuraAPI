'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowDownRight
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
        // Fallback demo data
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
        // Fallback selected order
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
    // Real-time automatic polling every 4 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, [page, statusFilter, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const filterTabs = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Successful', value: 'SUCCESS' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Failed', value: 'FAILED' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
              <span>Orders Management</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                {totalOrders} Orders
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Stream</span>
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Complete history of automated game top-ups submitted via API and dashboard.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[#16122d] hover:bg-[#201844] border border-[#2d2454] text-xs text-zinc-300 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg animate-slide-up-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {filterTabs.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    active
                      ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1b1536]'
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
                placeholder="Order ID, Player ID, Game..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-[#1b1536] hover:bg-[#261f49] border border-[#352963] text-purple-300 text-xs font-medium transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Orders Table */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl overflow-hidden shadow-xl animate-slide-up-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#100d1e] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#221c3b]">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Game</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Player Details</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1738]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                        <span>Fetching orders ledger...</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#181330] transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-medium text-purple-300">{ord.orderNumber}</div>
                        {ord.resellerOrderId && (
                          <div className="text-[10px] text-zinc-500 font-mono">Ref: {ord.resellerOrderId}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{ord.game}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{ord.product}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-zinc-200">UID: {ord.playerId}</div>
                        {ord.serverId && (
                          <div className="text-[10px] text-amber-400 font-mono">Server: {ord.serverId}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        ${parseFloat(ord.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            ord.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : ord.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {ord.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                          {ord.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {ord.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                        {new Date(ord.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openOrderDetail(ord.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1b1536] hover:bg-[#271d50] border border-[#352963] text-purple-300 text-xs font-medium transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#221c3b] flex items-center justify-between text-xs text-zinc-400">
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-[#16122d] border border-[#2d2454] disabled:opacity-40 hover:bg-[#221c45] transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-[#16122d] border border-[#2d2454] disabled:opacity-40 hover:bg-[#221c45] transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#120e24] border border-[#2b2252] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-[#221c3b] flex items-center justify-between bg-[#15102a]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Order Details:</span>
                    <span className="font-mono text-purple-300">{selectedOrder.orderNumber}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">Complete immutable record</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg bg-[#1e1738] hover:bg-[#2d2254] text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Status Callout */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    selectedOrder.status === 'SUCCESS'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : selectedOrder.status === 'PENDING'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      : 'bg-red-500/10 border-red-500/20 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedOrder.status === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {selectedOrder.status === 'PENDING' && <Clock className="w-4 h-4 text-amber-400" />}
                    {selectedOrder.status === 'FAILED' && <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="font-bold uppercase tracking-wider">{selectedOrder.status}</span>
                  </div>
                  <span className="font-bold text-white text-base">${parseFloat(selectedOrder.amount).toFixed(2)}</span>
                </div>

                {selectedOrder.failureReason && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <div>
                      <strong>Provider Error:</strong> {selectedOrder.failureReason}
                    </div>
                  </div>
                )}

                {/* Detail Breakdown */}
                <div className="bg-[#0b0914] rounded-xl p-3.5 border border-[#231b40] space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#1b1535]">
                    <span className="text-zinc-400">Reseller Order Ref:</span>
                    <span className="font-mono text-white">{selectedOrder.resellerOrderId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1b1535]">
                    <span className="text-zinc-400">Upstream Provider Ref:</span>
                    <span className="font-mono text-purple-300">{selectedOrder.providerOrderId || 'PENDING'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1b1535]">
                    <span className="text-zinc-400">Game:</span>
                    <span className="text-white font-medium">{selectedOrder.game?.name || selectedOrder.game}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1b1535]">
                    <span className="text-zinc-400">Product Denomination:</span>
                    <span className="text-white font-medium">{selectedOrder.product?.name || selectedOrder.product}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1b1535]">
                    <span className="text-zinc-400">Player UID:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{selectedOrder.playerInfo?.playerId || selectedOrder.playerId}</span>
                  </div>
                  {(selectedOrder.playerInfo?.serverId || selectedOrder.serverId) && (
                    <div className="flex justify-between py-1 border-b border-[#1b1535]">
                      <span className="text-zinc-400">Server ID:</span>
                      <span className="font-mono text-amber-300">{selectedOrder.playerInfo?.serverId || selectedOrder.serverId}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Timestamp:</span>
                    <span className="text-zinc-300">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#221c3b] bg-[#100d1e] text-right">
                <button
                  onClick={() => setSelectedOrder(null)}
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
