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
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Key,
  Gamepad2,
  Receipt,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  PlusCircle,
  X,
  Send,
  Loader2,
  RotateCw,
  UserCheck,
  Search,
  Sparkles,
  QrCode,
  ShieldCheck,
  Activity,
  History
} from 'lucide-react';

export default function DashboardPage() {
  const { user, reseller, token, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // New Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [syncingOrders, setSyncingOrders] = useState(false);

  const [formGame, setFormGame] = useState('mobile-legends');
  const [formProduct, setFormProduct] = useState('mlbb-86');
  const [formPlayerId, setFormPlayerId] = useState('1473883595');
  const [formServerId, setFormServerId] = useState('14309');
  const [formResellerOrder, setFormResellerOrder] = useState(`ORD-${Date.now().toString().slice(-6)}`);

  // Game ID Verification State
  const [checkingId, setCheckingId] = useState(false);
  const [idCheckResult, setIdCheckResult] = useState<{
    valid: boolean;
    username: string | null;
    region?: string | null;
    gameTitle?: string | null;
    message?: string;
  } | null>(null);
  const [checkIdModalOpen, setCheckIdModalOpen] = useState(false);

  const gamesList = [
    {
      code: 'mobile-legends',
      name: 'Mobile Legends: Bang Bang',
      requiresServerId: true,
      serverLabel: 'Zone ID',
      products: [
        { code: 'mlbb-86', name: '86 Diamonds', price: 1.45 },
        { code: 'mlbb-257', name: '257 Diamonds', price: 4.20 },
        { code: 'mlbb-pass', name: 'Weekly Diamond Pass', price: 2.00 },
      ],
    },
    {
      code: 'free-fire',
      name: 'Garena Free Fire',
      requiresServerId: false,
      products: [
        { code: 'ff-100', name: '100 Diamonds', price: 1.00 },
        { code: 'ff-310', name: '310 Diamonds', price: 3.00 },
        { code: 'ff-520', name: '520 Diamonds', price: 4.95 },
      ],
    },
    {
      code: 'genshin-impact',
      name: 'Genshin Impact',
      requiresServerId: true,
      serverLabel: 'Server (os_asia, etc.)',
      products: [
        { code: 'gi-60', name: '60 Genesis Crystals', price: 1.05 },
        { code: 'gi-330', name: '300+30 Genesis Crystals', price: 5.00 },
        { code: 'gi-welkin', name: 'Blessing of the Welkin Moon', price: 5.10 },
      ],
    },
    {
      code: 'pubg-mobile',
      name: 'PUBG Mobile',
      requiresServerId: false,
      products: [
        { code: 'pubg-60', name: '60 UC', price: 1.00 },
        { code: 'pubg-325', name: '325 UC', price: 4.95 },
      ],
    },
  ];

  const selectedGameObj = gamesList.find((g) => g.code === formGame) || gamesList[0];

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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitting(true);
    setOrderError(null);
    setOrderSuccess(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      const res = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          game: formGame,
          product: formProduct,
          player_id: formPlayerId.trim(),
          server_id: selectedGameObj.requiresServerId ? formServerId.trim() : undefined,
          reseller_order_id: formResellerOrder.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to submit order');
      }

      const orderResult = json.data || json;
      setOrderSuccess(orderResult);
      fetchDashboard();
      refreshProfile();
      setFormResellerOrder(`ORD-${Date.now().toString().slice(-6)}`);
    } catch (err: any) {
      setOrderError(err.message);
    } finally {
      setOrderSubmitting(false);
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

  const handleCheckGameId = async () => {
    if (!formPlayerId.trim()) {
      setIdCheckResult({
        valid: false,
        username: null,
        message: 'សូមវាយបញ្ចូល Player User ID ជាមុនសិន',
      });
      return;
    }

    setCheckingId(true);
    setIdCheckResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      const res = await fetch(`${apiUrl}/games/check-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          game: formGame,
          userid: formPlayerId.trim(),
          serverid: selectedGameObj.requiresServerId ? formServerId.trim() : undefined,
        }),
      });

      const json = await res.json();
      const result = json.data || json;
      if (!res.ok) {
        throw new Error(result.error?.message || result.message || 'ID verification failed');
      }
      setIdCheckResult(result);
    } catch (err: any) {
      setIdCheckResult({
        valid: false,
        username: null,
        message: err.message || 'រកមិនឃើញតួអង្គ ឬ Server ID មិនត្រឹមត្រូវ',
      });
    } finally {
      setCheckingId(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-pink-600/20 shrink-0">
                <div className="w-full h-full bg-[#0d091e] rounded-[14px] flex items-center justify-center font-black text-lg text-pink-300">
                  {user?.name ? user.name.slice(0, 1).toUpperCase() : 'S'}
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
                  <span>@{user?.telegram || user?.email?.split('@')[0] || 'reseller'}</span>
                  {reseller?.companyName && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-300 font-medium">{reseller.companyName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:self-center">
              <button
                onClick={() => setOrderModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs transition shadow-md shadow-pink-600/25 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ កុម្ម៉ង់ Top-up</span>
              </button>

              <Link
                href="/funding"
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#191136] hover:bg-[#251a50] border border-[#342468] text-pink-300 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5 text-pink-400" />
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

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setOrderModalOpen(true)}
              className="p-3.5 rounded-2xl bg-[#120a2e] hover:bg-[#1b1042] border border-[#2c1d54] text-left transition flex items-center gap-3 group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 group-hover:scale-105 transition">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">កុម្ម៉ង់ Top-up</div>
                <div className="text-[10px] text-zinc-400">បង្កើត Order ភ្លាមៗ</div>
              </div>
            </button>

            <button
              onClick={() => setCheckIdModalOpen(true)}
              className="p-3.5 rounded-2xl bg-[#120a2e] hover:bg-[#1b1042] border border-[#2c1d54] text-left transition flex items-center gap-3 group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">ឆែក ID ហ្គេម</div>
                <div className="text-[10px] text-zinc-400">Validate IGN ស្វ័យប្រវត្តិ</div>
              </div>
            </button>

            <Link
              href="/categories"
              className="p-3.5 rounded-2xl bg-[#120a2e] hover:bg-[#1b1042] border border-[#2c1d54] text-left transition flex items-center gap-3 group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">បញ្ជីហ្គេម</div>
                <div className="text-[10px] text-zinc-400">តម្លៃ & កញ្ចប់ពេជ្រ</div>
              </div>
            </Link>

            <Link
              href="/api-access"
              className="p-3.5 rounded-2xl bg-[#120a2e] hover:bg-[#1b1042] border border-[#2c1d54] text-left transition flex items-center gap-3 group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400 group-hover:scale-105 transition">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">API Access</div>
                <div className="text-[10px] text-zinc-400">គ្រប់គ្រង API Key</div>
              </div>
            </Link>
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

          {/* Modal: Create Top-up Order */}
          {orderModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#120a2b] border border-[#2b1e52] rounded-3xl w-full max-w-lg shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#21163f]">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-pink-400" />
                    <span>បញ្ជាទិញ Top-up (New Order)</span>
                  </h3>
                  <button
                    onClick={() => {
                      setOrderModalOpen(false);
                      setOrderSuccess(null);
                      setOrderError(null);
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {orderSuccess ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-2xl border space-y-2 ${
                        orderSuccess.status === 'SUCCESS'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>ការបញ្ជាទិញបានជោគជ័យ!</span>
                      </div>
                      <div className="text-xs text-zinc-300 space-y-1">
                        <div>Order Ref: <strong className="font-mono text-white">{orderSuccess.order_id}</strong></div>
                        <div>តម្លៃ: <strong className="text-emerald-400">${orderSuccess.amount} USD</strong></div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setOrderSuccess(null);
                        setOrderModalOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition"
                    >
                      បិទផ្ទាំង (Done)
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-3.5 text-xs">
                    {orderError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        {orderError}
                      </div>
                    )}

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">ប្រភេទហ្គេម</label>
                      <select
                        value={formGame}
                        onChange={(e) => {
                          const newGame = e.target.value;
                          setFormGame(newGame);
                          const matched = gamesList.find((g) => g.code === newGame);
                          if (matched && matched.products.length > 0) {
                            setFormProduct(matched.products[0].code);
                          }
                          setIdCheckResult(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b061b] border border-[#2b1f50] text-sm text-white focus:outline-none focus:border-pink-500 transition"
                      >
                        {gamesList.map((g) => (
                          <option key={g.code} value={g.code}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">កញ្ចប់ពេជ្រ / UC</label>
                      <select
                        value={formProduct}
                        onChange={(e) => setFormProduct(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b061b] border border-[#2b1f50] text-sm text-white focus:outline-none focus:border-pink-500 transition"
                      >
                        {selectedGameObj.products.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name} — ${p.price.toFixed(2)} USD
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">User ID / Player ID</label>
                        <input
                          type="text"
                          required
                          placeholder="ឧ. 1473883595"
                          value={formPlayerId}
                          onChange={(e) => {
                            setFormPlayerId(e.target.value);
                            setIdCheckResult(null);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b061b] border border-[#2b1f50] text-sm text-white focus:outline-none focus:border-pink-500 transition"
                        />
                      </div>

                      {selectedGameObj.requiresServerId && (
                        <div>
                          <label className="block text-zinc-300 font-semibold mb-1">
                            {selectedGameObj.serverLabel || 'Zone ID'}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Zone ID (ឧ. 14309)"
                            value={formServerId}
                            onChange={(e) => {
                              setFormServerId(e.target.value);
                              setIdCheckResult(null);
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b061b] border border-[#2b1f50] text-sm text-white focus:outline-none focus:border-pink-500 transition"
                          />
                        </div>
                      )}
                    </div>

                    {/* Validate ID Inline */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleCheckGameId}
                        disabled={checkingId || !formPlayerId.trim()}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {checkingId ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                            <span>កំពុងឆែក...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span>ឆែកឈ្មោះ (Check IGN)</span>
                          </>
                        )}
                      </button>

                      {idCheckResult && (
                        <div className="text-xs">
                          {idCheckResult.valid ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {idCheckResult.username}
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold">រកមិនឃើញ ID</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={orderSubmitting}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md shadow-pink-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {orderSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>កំពុងដំណើរការ...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>បញ្ជាក់ការកុម្ម៉ង់ (Submit Order)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Modal: Check Game ID */}
          {checkIdModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#120a2b] border border-[#2b1e52] rounded-3xl w-full max-w-lg shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#21163f]">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>ឆែកស្វែងរកឈ្មោះ In-game Name</span>
                  </h3>
                  <button
                    onClick={() => {
                      setCheckIdModalOpen(false);
                      setIdCheckResult(null);
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">ហ្គេម (Game)</label>
                    <select
                      value={formGame}
                      onChange={(e) => {
                        setFormGame(e.target.value);
                        setIdCheckResult(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b061b] border border-[#2b1f50] text-sm text-white focus:outline-none focus:border-purple-500 transition"
                    >
                      {gamesList.map((g) => (
                        <option key={g.code} value={g.code}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">User ID / Player ID</label>
                      <input
                        type="text"
                        placeholder="ឧ. 1473883595"
                        value={formPlayerId}
                        onChange={(e) => {
                          setFormPlayerId(e.target.value);
                          setIdCheckResult(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b061b] border border-[#2b1f50] text-sm text-white focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    {selectedGameObj.requiresServerId && (
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          {selectedGameObj.serverLabel || 'Zone ID'}
                        </label>
                        <input
                          type="text"
                          placeholder="Zone ID (ឧ. 14309)"
                          value={formServerId}
                          onChange={(e) => {
                            setFormServerId(e.target.value);
                            setIdCheckResult(null);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b061b] border border-[#2b1f50] text-sm text-white focus:outline-none focus:border-purple-500 transition"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckGameId}
                    disabled={checkingId || !formPlayerId.trim()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {checkingId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>កំពុងស្វែងរក...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>ស្វែងរកឈ្មោះតួអង្គ</span>
                      </>
                    )}
                  </button>

                  {idCheckResult && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                        idCheckResult.valid
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {idCheckResult.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        {idCheckResult.valid ? (
                          <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                            <span>ឈ្មោះ (IGN):</span>
                            <span className="text-emerald-300 font-mono text-sm underline">
                              {idCheckResult.username}
                            </span>
                            {idCheckResult.region && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {idCheckResult.region}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>{idCheckResult.message || 'រកមិនឃើញតួអង្គ ឬ Server ID មិនត្រឹមត្រូវ'}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
