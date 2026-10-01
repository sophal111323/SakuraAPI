'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Users,
  Coins,
  Activity,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Gamepad2,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        // Fallback for preview
        setData({
          kpi: {
            totalResellers: 12,
            activeResellers: 11,
            totalOrders: 148,
            totalSpent: '482.50',
            todayOrders: 14,
            todayRevenue: '38.20',
            successfulOrders: 139,
            failedOrders: 5,
            pendingOrders: 4,
            totalResellerBalance: '1420.00',
            totalApiRequests: 1840,
          },
          recentOrders: [
            {
              id: 'ord-1',
              orderNumber: 'SK-2026-0001',
              resellerName: 'Demo Reseller',
              resellerEmail: 'reseller@sakuraapi.com',
              game: 'Mobile Legends: Bang Bang',
              product: '86 Diamonds',
              amount: '1.45',
              status: 'SUCCESS',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'ord-2',
              orderNumber: 'SK-2026-0002',
              resellerName: 'Demo Reseller',
              resellerEmail: 'reseller@sakuraapi.com',
              game: 'Mobile Legends: Bang Bang',
              product: '86 Diamonds',
              amount: '1.45',
              status: 'PENDING',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
          recentAuditActions: [
            {
              id: 'act-1',
              adminName: 'Sakura Administrator',
              action: 'ADJUST_BALANCE',
              targetEntity: 'Reseller',
              details: { amount: 100, type: 'ADMIN_CREDIT', note: 'Initial welcome balance' },
              createdAt: new Date().toISOString(),
            },
          ],
        });
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setData(json.data || json);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const kpi = data?.kpi || {
    totalResellers: 0,
    activeResellers: 0,
    totalOrders: 0,
    totalSpent: '0.00',
    todayOrders: 0,
    todayRevenue: '0.00',
    successfulOrders: 0,
    failedOrders: 0,
    pendingOrders: 0,
    totalResellerBalance: '0.00',
    totalApiRequests: 0,
  };

  return (
    <AuthGuard redirectTo="/register" adminOnly={true}>
      <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
        <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <span>SakuraAPI Admin Control Center</span>
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                System Administrator
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Platform-wide revenue, reseller balances, automated order metrics, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-[#16122d] hover:bg-[#201844] border border-[#2d2454] text-xs text-zinc-300 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
              <span>Refresh Stats</span>
            </button>
            <Link
              href="/admin/balance"
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-md shadow-purple-600/30 flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Balance Manager</span>
            </Link>
          </div>
        </div>

        {/* Quick Management Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/games"
            className="p-4 rounded-2xl bg-[#130f26] border border-[#2b2252] hover:border-pink-500/50 transition group shadow-lg flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <div className="font-bold text-white text-xs sm:text-sm group-hover:text-pink-300 transition">
                គ្រប់គ្រងហ្គេម & ស្តុក
              </div>
              <div className="text-[10px] text-zinc-400">Add games, logo, items</div>
            </div>
          </Link>

          <Link
            href="/admin/resellers"
            className="p-4 rounded-2xl bg-[#130f26] border border-[#2b2252] hover:border-purple-500/50 transition group shadow-lg flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <div className="font-bold text-white text-xs sm:text-sm group-hover:text-purple-300 transition">
                គ្រប់គ្រង Resellers
              </div>
              <div className="text-[10px] text-zinc-400">Accounts, quick top-up</div>
            </div>
          </Link>

          <Link
            href="/admin/balance"
            className="p-4 rounded-2xl bg-[#130f26] border border-[#2b2252] hover:border-emerald-500/50 transition group shadow-lg flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <div className="font-bold text-white text-xs sm:text-sm group-hover:text-emerald-300 transition">
                បញ្ចូល/កាត់លុយ (Balance)
              </div>
              <div className="text-[10px] text-zinc-400">Credit / Debit ledger</div>
            </div>
          </Link>

          <Link
            href="/admin/logs"
            className="p-4 rounded-2xl bg-[#130f26] border border-[#2b2252] hover:border-indigo-500/50 transition group shadow-lg flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <div className="font-bold text-white text-xs sm:text-sm group-hover:text-indigo-300 transition">
                API Request Logs
              </div>
              <div className="text-[10px] text-zinc-400">Live API monitoring</div>
            </div>
          </Link>
        </div>

        {/* High-Level Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Platform Revenue */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Orders Volume</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ${parseFloat(kpi.totalSpent || '0.00').toFixed(2)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                From {kpi.successfulOrders} fulfilled orders
              </p>
            </div>
            <div className="pt-2 border-t border-[#221c3b] flex items-center justify-between text-xs text-zinc-400">
              <span>Today's Vol:</span>
              <span className="font-semibold text-emerald-400">${parseFloat(kpi.todayRevenue || '0.00').toFixed(2)}</span>
            </div>
          </div>

          {/* Card 2: Total Float / Reseller Balances */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Reseller Float</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Coins className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ${parseFloat(kpi.totalResellerBalance || '0.00').toFixed(2)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Across all registered reseller wallets
              </p>
            </div>
            <div className="pt-2 border-t border-[#221c3b] flex items-center justify-between text-xs text-zinc-400">
              <span>Reseller Accounts:</span>
              <span className="font-semibold text-white">{kpi.totalResellers}</span>
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Top-up Orders</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {kpi.totalOrders.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {kpi.todayOrders} orders processed today
              </p>
            </div>
            <div className="pt-2 border-t border-[#221c3b] flex items-center justify-between text-xs text-zinc-400">
              <span>Success Rate:</span>
              <span className="font-semibold text-emerald-400">
                {kpi.totalOrders > 0 ? `${Math.round((kpi.successfulOrders / kpi.totalOrders) * 100)}%` : '100%'}
              </span>
            </div>
          </div>

          {/* Card 4: Total API Gateway Requests */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total API Gateway Calls</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight font-mono">
                {kpi.totalApiRequests.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Monitored and rate-limited
              </p>
            </div>
            <div className="pt-2 border-t border-[#221c3b] flex items-center justify-between text-xs text-zinc-400">
              <Link href="/admin/logs" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                <span>View Request Logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Status Breakdown Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#130f26] border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-400">Successful Top-ups</div>
                <div className="text-xl font-bold text-white">{kpi.successfulOrders}</div>
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Fulfillment OK
            </span>
          </div>

          <div className="bg-[#130f26] border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-400">Pending SoraTopup Orders</div>
                <div className="text-xl font-bold text-white">{kpi.pendingOrders}</div>
              </div>
            </div>
            <span className="text-xs font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
              Awaiting Provider
            </span>
          </div>

          <div className="bg-[#130f26] border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-400">Failed / Auto-Refunded</div>
                <div className="text-xl font-bold text-white">{kpi.failedOrders}</div>
              </div>
            </div>
            <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
              Zero Loss
            </span>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/resellers"
            className="p-5 rounded-2xl bg-[#130f26] border border-[#2b2252] hover:border-purple-500/40 transition group space-y-2 shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Manage Reseller Accounts</h3>
            <p className="text-xs text-zinc-400">Activate or suspend accounts, view individual balances, and configure custom markup tiers.</p>
          </Link>

          <Link
            href="/admin/balance"
            className="p-5 rounded-2xl bg-[#130f26] border border-[#2b2252] hover:border-purple-500/40 transition group space-y-2 shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Balance Adjuster & Ledger</h3>
            <p className="text-xs text-zinc-400">Safely deposit or deduct balance for any reseller with required audit notes and row-locking.</p>
          </Link>

          <Link
            href="/admin/logs"
            className="p-5 rounded-2xl bg-[#130f26] border border-[#2b2252] hover:border-purple-500/40 transition group space-y-2 shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">API Request Logs</h3>
            <p className="text-xs text-zinc-400">Monitor all incoming API requests, HTTP status codes, latency timings, and reseller callers.</p>
          </Link>
        </div>

        {/* Recent Platform Orders Table */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-[#221c3b] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Recent Platform Orders</h2>
              <p className="text-[11px] text-zinc-400">All orders placed across all resellers</p>
            </div>
            <Link
              href="/orders"
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              <span>View Global Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#100d1e] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#221c3b]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Reseller</th>
                  <th className="py-3 px-4">Game</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1738]">
                {data?.recentOrders && data.recentOrders.length > 0 ? (
                  data.recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-[#181330] transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-purple-300">{ord.orderNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{ord.resellerName}</div>
                        <div className="text-[10px] text-zinc-400">{ord.resellerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">{ord.game}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{ord.product}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">${parseFloat(ord.amount).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            ord.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : ord.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      No platform orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
