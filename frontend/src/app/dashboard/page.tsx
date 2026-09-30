'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  Wallet,
  ShoppingBag,
  TrendingUp,
  Receipt,
  ChevronRight,
  RotateCw,
  QrCode,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, reseller, token, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        setData({
          balance: reseller?.balance || '0.00',
          currency: reseller?.currency || 'USD',
          metrics: {
            totalOrders: 0,
            totalSpent: '0.00',
            todayOrders: 0,
            todaySpent: '0.00',
            successfulOrders: 0,
            failedOrders: 0,
            pendingOrders: 0,
            totalApiRequests: 0,
          },
          recentOrders: [],
        });
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/reseller/dashboard`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load dashboard: ${res.statusText}`);
      }

      const json = await res.json();
      setData(json.data || json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOrders = async () => {
    setSyncingOrders(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);
      await fetch(`${apiUrl}/orders/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      await fetchDashboard();
      await refreshProfile();
    } catch {
      // Ignore
    } finally {
      setSyncingOrders(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => {
      fetchDashboard();
    }, 20000);
    return () => clearInterval(interval);
  }, [token]);

  const metrics = data?.metrics || {
    totalOrders: 0,
    totalSpent: '0.00',
    todayOrders: 0,
    todaySpent: '0.00',
    successfulOrders: 0,
    failedOrders: 0,
    pendingOrders: 0,
    totalApiRequests: 0,
  };

  const formattedTelegram = user?.telegram
    ? user.telegram.startsWith('@')
      ? user.telegram
      : `@${user.telegram}`
    : user?.email
    ? `@${user.email.split('@')[0]}`
    : '@reseller';

  const cleanTelegram = (user?.telegram || reseller?.telegram || '').replace(/^@/, '');
  const apiUrlBase = process.env.NEXT_PUBLIC_API_URL || 'https://sakuraapi.lol/api/v1';
  const avatarSrc = user?.avatarUrl
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${apiUrlBase}${user.avatarUrl}`)
    : cleanTelegram
    ? `${apiUrlBase}/avatar/${cleanTelegram}`
    : null;

  return (
    <AuthGuard redirectTo="/register">
      <div className="min-h-screen bg-[#070414] text-white selection:bg-pink-500 selection:text-white pb-16">
        <Navigation />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-pink-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 relative z-10">
          {/* Header Profile Bar */}
          <div className="bg-[#100a26]/90 border border-[#261c47] rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-pink-600/20 shrink-0 relative overflow-hidden">
                <div className="w-full h-full bg-[#0d091e] rounded-[14px] flex items-center justify-center font-black text-lg text-pink-300 overflow-hidden relative">
                  {avatarSrc && !avatarError ? (
                    <img
                      src={avatarSrc}
                      alt={user?.name || 'Telegram Profile'}
                      className="w-full h-full object-cover rounded-[14px]"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span>{user?.name ? user.name.slice(0, 1).toUpperCase() : 'S'}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {user?.name || 'Reseller'}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30">
                    RESELLER គណនី
                  </span>
                </div>
                <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                  <span>{formattedTelegram}</span>
                  {reseller?.companyName && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-300 font-medium">{reseller.companyName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Clean KHQR Deposit Button */}
            <div className="flex items-center gap-2 sm:self-center">
              <Link
                href="/funding"
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs transition shadow-md shadow-pink-600/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <QrCode className="w-4 h-4 text-white" />
                <span>បញ្ចូលប្រាក់ KHQR</span>
              </Link>
            </div>
          </div>

          {/* Primary Metric Cards (Ultra Clean) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Wallet Balance */}
            <div className="bg-[#0f0924] border border-[#2b1f52] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-pink-500/40 transition">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>សមតុល្យ (Balance)</span>
                <Wallet className="w-4 h-4 text-pink-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ${parseFloat(data?.balance || reseller?.balance || '0.00').toFixed(2)}
                <span className="text-xs font-semibold text-pink-400 ml-1">USD</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#1c133a] flex items-center justify-between text-[11px]">
                <Link href="/funding" className="text-pink-400 hover:underline flex items-center gap-1 font-semibold">
                  <span>+ បញ្ចូលបន្ថែម</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
                <span className="text-zinc-500 font-mono">Instant KHQR</span>
              </div>
            </div>

            {/* 2. Total Spent */}
            <div className="bg-[#0f0924] border border-[#2b1f52] rounded-2xl p-4 sm:p-5 shadow-lg group hover:border-purple-500/40 transition">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>ចំណាយសរុប (Total Spent)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ${parseFloat(metrics.totalSpent || '0.00').toFixed(2)}
                <span className="text-xs font-semibold text-emerald-400 ml-1">USD</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#1c133a] flex items-center justify-between text-[11px] text-zinc-400">
                <span>ថ្ងៃនេះ៖</span>
                <span className="font-semibold text-emerald-400">${parseFloat(metrics.todaySpent || '0.00').toFixed(2)}</span>
              </div>
            </div>

            {/* 3. Total Orders */}
            <div className="bg-[#0f0924] border border-[#2b1f52] rounded-2xl p-4 sm:p-5 shadow-lg group hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>ការបញ្ជាទិញ (Orders)</span>
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {metrics.totalOrders.toLocaleString()}
              </div>
              <div className="mt-2 pt-2 border-t border-[#1c133a] flex items-center justify-between text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-semibold">{metrics.successfulOrders} ជោគជ័យ</span>
                {metrics.pendingOrders > 0 && (
                  <span className="text-amber-400 font-semibold">{metrics.pendingOrders} ដំណើរការ</span>
                )}
              </div>
            </div>

            {/* 4. API Requests */}
            <div className="bg-[#0f0924] border border-[#2b1f52] rounded-2xl p-4 sm:p-5 shadow-lg group hover:border-sky-500/40 transition">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>ការហៅ API Gateway</span>
                <Activity className="w-4 h-4 text-sky-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                {metrics.totalApiRequests.toLocaleString()}
              </div>
              <div className="mt-2 pt-2 border-t border-[#1c133a] flex items-center justify-between text-[11px] text-zinc-400">
                <span>ស្ថានភាព API៖</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online (100/m)
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-[#0f0924] border border-[#271c47] rounded-3xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#21163f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-pink-400" />
                <h2 className="text-sm font-bold text-white">ការបញ្ជាទិញចុងក្រោយ (Recent Orders)</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncOrders}
                  disabled={syncingOrders}
                  title="ធ្វើបច្ចុប្បន្នភាព"
                  className="p-1.5 rounded-lg bg-[#191136] hover:bg-[#251a50] border border-[#2e2050] text-zinc-300 hover:text-white transition"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${syncingOrders ? 'animate-spin text-pink-400' : ''}`} />
                </button>
                <Link
                  href="/orders"
                  className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-0.5"
                >
                  <span>មើលទាំងអស់</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Mobile View: Cards Layout */}
            <div className="sm:hidden divide-y divide-[#1c133a]">
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.slice(0, 5).map((ord: any) => (
                  <div key={ord.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{ord.game}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          ord.status === 'SUCCESS'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : ord.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {ord.status === 'SUCCESS' ? 'ជោគជ័យ' : ord.status === 'PENDING' ? 'ដំណើរការ' : 'បរាជ័យ'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">{ord.product}</span>
                      <span className="font-bold text-white">${parseFloat(ord.amount).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>ID: {ord.playerId}</span>
                      <span>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500">
                  មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ។
                </div>
              )}
            </div>

            {/* Desktop View: Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b061c] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#21163f]">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">ហ្គេម (Game)</th>
                    <th className="py-3 px-4">កញ្ចប់ពេជ្រ</th>
                    <th className="py-3 px-4">Player ID</th>
                    <th className="py-3 px-4">តម្លៃ (Price)</th>
                    <th className="py-3 px-4">ស្ថានភាព</th>
                    <th className="py-3 px-4">ពេលវេលា</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1236]">
                  {data?.recentOrders && data.recentOrders.length > 0 ? (
                    data.recentOrders.slice(0, 8).map((ord: any) => (
                      <tr key={ord.id} className="hover:bg-[#150d32] transition">
                        <td className="py-3 px-4 font-mono font-medium text-pink-300">{ord.orderNumber}</td>
                        <td className="py-3 px-4 font-semibold text-white">{ord.game}</td>
                        <td className="py-3 px-4 text-zinc-300">{ord.product}</td>
                        <td className="py-3 px-4 font-mono text-zinc-400">{ord.playerId}</td>
                        <td className="py-3 px-4 font-bold text-white">${parseFloat(ord.amount).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              ord.status === 'SUCCESS'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : ord.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {ord.status === 'SUCCESS' ? 'ជោគជ័យ' : ord.status === 'PENDING' ? 'ដំណើរការ' : 'បរាជ័យ'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500">
                        មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ។
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
