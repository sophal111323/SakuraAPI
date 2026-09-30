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
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  PlusCircle,
  X,
  Send,
  Loader2,
  RotateCw,
  UserCheck,
  Search,
  Sparkles,
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
  const [formPlayerId, setFormPlayerId] = useState('12345678');
  const [formServerId, setFormServerId] = useState('1234');
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
      serverLabel: 'Zone ID (4 digits)',
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
      serverLabel: 'Server (os_asia, os_usa, etc.)',
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
            activeKeysCount: 0,
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
      // Refresh dashboard stats & profile balance
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
        message: 'Please enter a Player User ID first',
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
        message: err.message || 'Verification failed. Check network or server ID.',
      });
    } finally {
      setCheckingId(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Real-time automatic data sync every 4 seconds
    const interval = setInterval(() => {
      fetchDashboard();
    }, 4000);
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
      <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
        <Navigation />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-purple-900/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
        {/* Dashboard Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 animate-slide-up-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                ផ្ទាំងគ្រប់គ្រង Reseller (Dashboard)
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>ទិន្នន័យផ្សាយផ្ទាល់ (Live Sync)</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              តាមដានសមតុល្យកាបូបទឹកប្រាក់ ការបញ្ជាទិញស្វ័យប្រវត្ត និងការប្រើប្រាស់ API ជាក់ស្តែង។
            </p>
          </div>
        </div>

        {/* Hero Balance & Financials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-slide-up-2">
          {/* Card 1: Main Balance */}
          <div className="bg-gradient-to-br from-[#1a1238] via-[#140e2b] to-[#100b22] border-2 border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-purple-300">សមតុល្យដែលអាចប្រើបាន (Balance)</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
                ${parseFloat(data?.balance || reseller?.balance || '0.00').toFixed(2)}
                <span className="text-xs font-semibold text-purple-400">{data?.currency || 'USD'}</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                ប្រព័ន្ធសុវត្ថិភាពខ្ពស់ បង្វិលសងទឹកប្រាក់វិញស្វ័យប្រវត្តិ ១០០% ប្រសិនបើមានបញ្ហា
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#291f4a] flex items-center justify-between text-xs">
              <Link href="/funding" className="text-purple-300 hover:text-white flex items-center gap-1 transition font-medium">
                <span>ប្រវត្តិបញ្ចូលលុយ (Funding Ledger)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Total Spent */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">ទឹកប្រាក់ចំណាយសរុប (Total Spent)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ${parseFloat(metrics.totalSpent || '0.00').toFixed(2)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                ពីការបញ្ជាទិញជោគជ័យសរុប {metrics.successfulOrders} Orders
              </p>
            </div>
            <div className="pt-2 border-t border-[#221c3b] flex items-center justify-between text-xs text-zinc-400">
              <span>ចំណាយថ្ងៃនេះ៖</span>
              <span className="font-semibold text-emerald-400">${parseFloat(metrics.todaySpent || '0.00').toFixed(2)}</span>
            </div>
          </div>

          {/* Card 3: Total Orders & API Activity */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">ការបញ្ជាទិញសរុប (Total Orders)</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {metrics.totalOrders.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {metrics.todayOrders} បានកុម្ម៉ង់ថ្ងៃនេះ
              </p>
            </div>
            <div className="pt-2 border-t border-[#221c3b] flex items-center justify-between text-xs text-zinc-400">
              <span>ការហៅ API Gateway៖</span>
              <span className="font-mono text-purple-300 font-semibold">{metrics.totalApiRequests.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up-3">
          <div className="bg-[#130f26] border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-400">ការបញ្ជាទិញជោគជ័យ</div>
                <div className="text-xl font-bold text-white">{metrics.successfulOrders}</div>
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {metrics.totalOrders > 0 ? `${Math.round((metrics.successfulOrders / metrics.totalOrders) * 100)}%` : '100%'}
            </span>
          </div>

          <div className="bg-[#130f26] border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-400">កំពុងដំណើរការ (Pending)</div>
                <div className="text-xl font-bold text-white">{metrics.pendingOrders}</div>
              </div>
            </div>
            <span className="text-xs font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
              ដំណើរការ
            </span>
          </div>

          <div className="bg-[#130f26] border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-400">បរាជ័យ / បានបង្វិលសង</div>
                <div className="text-xl font-bold text-white">{metrics.failedOrders}</div>
              </div>
            </div>
            <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
              គ្មានការខាតបង់
            </span>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl overflow-hidden shadow-xl animate-slide-up-4">
          <div className="p-5 border-b border-[#221c3b] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">ប្រវត្តិបញ្ជាទិញថ្មីៗ (Recent Orders)</h2>
              <p className="text-[11px] text-zinc-400">រាល់ប្រតិបត្តិការចុងក្រោយបង្អស់តាមរយៈ SakuraAPI</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncOrders}
                disabled={syncingOrders}
                className="px-2.5 py-1.5 rounded-lg bg-[#181330] hover:bg-[#251d4c] border border-[#2d2454] text-xs text-purple-300 flex items-center gap-1 transition"
              >
                <RotateCw className={`w-3.5 h-3.5 ${syncingOrders ? 'animate-spin' : ''}`} />
                <span>ឆែកស្ថានភាព Pending</span>
              </button>
              <Link
                href="/orders"
                className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
              >
                <span>មើលទាំងអស់</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#100d1e] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#221c3b]">
                <tr>
                  <th className="py-3 px-4">លេខកូដ Order</th>
                  <th className="py-3 px-4">ហ្គេម</th>
                  <th className="py-3 px-4">កញ្ចប់ទំនិញ</th>
                  <th className="py-3 px-4">Player ID / UID</th>
                  <th className="py-3 px-4">តម្លៃ</th>
                  <th className="py-3 px-4">ស្ថានភាព</th>
                  <th className="py-3 px-4">ពេលវេលា</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1738]">
                {data?.recentOrders && data.recentOrders.length > 0 ? (
                  data.recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-[#181330] transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-purple-300">{ord.orderNumber}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{ord.game}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{ord.product}</td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">{ord.playerId}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">${parseFloat(ord.amount).toFixed(2)}</td>
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
                          {ord.status === 'SUCCESS' ? 'ជោគជ័យ' : ord.status === 'PENDING' ? 'កំពុងដំណើរការ' : 'បរាជ័យ'}
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
                      មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ។ ចាប់ផ្ដើមជាមួយ API ឬ បញ្ជាទិញឥឡូវនេះ!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Top-up Order */}
        {orderModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#120e24] border border-[#2b2252] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#221c3b]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-purple-400" />
                  <span>បង្កើតការបញ្ជាទិញ Top-up (Create Order)</span>
                </h3>
                <button
                  onClick={() => setOrderModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#201844] text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {orderSuccess ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      orderSuccess.status === 'SUCCESS'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : orderSuccess.status === 'PENDING'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                        : 'bg-red-500/10 border-red-500/20 text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {orderSuccess.status === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {orderSuccess.status === 'PENDING' && <Clock className="w-5 h-5 text-amber-400" />}
                      {orderSuccess.status === 'FAILED' && <XCircle className="w-5 h-5 text-red-400" />}
                      <span>ស្ថានភាពការបញ្ជាទិញ៖ {orderSuccess.status === 'SUCCESS' ? 'ជោគជ័យ' : orderSuccess.status === 'PENDING' ? 'កំពុងដំណើរការ' : 'បរាជ័យ'}</span>
                    </div>
                    <div className="text-xs text-zinc-300 space-y-1">
                      <div>លេខសម្គាល់ SakuraAPI Order៖ <strong className="font-mono text-white">{orderSuccess.order_id}</strong></div>
                      <div>តម្លៃ៖ <strong className="text-emerald-400">${orderSuccess.amount}</strong></div>
                      {orderSuccess.provider_order_id && (
                        <div>កូដយោង Provider Ref៖ <span className="font-mono text-purple-300">{orderSuccess.provider_order_id}</span></div>
                      )}
                      {orderSuccess.refunded && (
                        <div className="text-amber-400 font-semibold">✓ ទឹកប្រាក់ត្រូវបានបង្វិលសងចូលគណនីវិញ ១០០%។</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setOrderSuccess(null);
                      setOrderModalOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                  >
                    រួចរាល់ (Done)
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
                  {orderError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      {orderError}
                    </div>
                  )}

                  <div>
                    <label className="block text-zinc-300 font-medium mb-1.5">ប្រភេទហ្គេម (Game)</label>
                    <select
                      value={formGame}
                      onChange={(e) => {
                        const newGame = e.target.value;
                        setFormGame(newGame);
                        const matched = gamesList.find((g) => g.code === newGame);
                        if (matched && matched.products.length > 0) {
                          setFormProduct(matched.products[0].code);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white focus:outline-none focus:border-purple-500 transition"
                    >
                      {gamesList.map((g) => (
                        <option key={g.code} value={g.code}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-medium mb-1.5">កញ្ចប់ពេជ្រ / UC (Product)</label>
                    <select
                      value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white focus:outline-none focus:border-purple-500 transition"
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
                      <label className="block text-zinc-300 font-medium mb-1.5">User ID / Player ID របស់អ្នកលេង</label>
                      <input
                        type="text"
                        required
                        placeholder="ឧ. 1473883595"
                        value={formPlayerId}
                        onChange={(e) => setFormPlayerId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    {selectedGameObj.requiresServerId && (
                      <div>
                        <label className="block text-zinc-300 font-medium mb-1.5">
                          {selectedGameObj.serverLabel || 'Server ID / Zone ID'}
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                        />
                      </div>
                    )}
                  </div>

                  {/* Validate ID with Bay2Game */}
                  <div className="p-3 rounded-xl bg-[#140e29] border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>ផ្ទៀងផ្ទាត់ឈ្មោះ In-game Name ស្វ័យប្រវត្តិ</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCheckGameId}
                        disabled={checkingId || !formPlayerId.trim()}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-[11px] transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {checkingId ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                            <span>កំពុងពិនិត្យ...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 text-purple-400" />
                            <span>ឆែកឈ្មោះ</span>
                          </>
                        )}
                      </button>
                    </div>

                    {idCheckResult && (
                      <div
                        className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                          idCheckResult.valid
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-red-500/10 border-red-500/30 text-red-300'
                        }`}
                      >
                        {idCheckResult.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          {idCheckResult.valid ? (
                            <>
                              <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                                <span>ឈ្មោះតួអង្គ (IGN)៖</span>
                                <span className="text-emerald-300 font-mono text-sm underline decoration-emerald-500/50">
                                  {idCheckResult.username}
                                </span>
                                {idCheckResult.region && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {idCheckResult.region}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-emerald-400/80">
                                ✓ បានផ្ទៀងផ្ទាត់ត្រឹមត្រូវពី Server ហ្គេម
                              </div>
                            </>
                          ) : (
                            <div>{idCheckResult.message || 'រកមិនឃើញ Player ID ឬ Zone ID មិនត្រឹមត្រូវ'}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-medium mb-1.5">
                      លេខសម្គាល់ Order ផ្ទាល់ខ្លួន <span className="text-zinc-500 font-normal">(Reseller Ref / Idempotency)</span>
                    </label>
                    <input
                      type="text"
                      value={formResellerOrder}
                      onChange={(e) => setFormResellerOrder(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={orderSubmitting}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {orderSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>កំពុងកាត់ប្រាក់ & បញ្ជូនការបញ្ជាទិញ...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>បញ្ជាក់ការបញ្ជាទិញ Top-up ភ្លាមៗ</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Dedicated Game ID Validation Modal */}
        {checkIdModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#120e24] border border-[#2b2252] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#221c3b]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-400" />
                  <span>ផ្ទៀងផ្ទាត់ Player ID របស់តួអង្គហ្គេម</span>
                </h3>
                <button
                  onClick={() => setCheckIdModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#201844] text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">ហ្គេម (Game)</label>
                  <select
                    value={formGame}
                    onChange={(e) => {
                      setFormGame(e.target.value);
                      setIdCheckResult(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    {gamesList.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.name} ({g.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1.5">User ID / Player ID របស់អ្នកលេង</label>
                    <input
                      type="text"
                      placeholder="ឧ. 1473883595"
                      value={formPlayerId}
                      onChange={(e) => {
                        setFormPlayerId(e.target.value);
                        setIdCheckResult(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  {selectedGameObj.requiresServerId && (
                    <div>
                      <label className="block text-zinc-300 font-medium mb-1.5">
                        {selectedGameObj.serverLabel || 'Server ID / Zone ID'}
                      </label>
                      <input
                        type="text"
                        placeholder="Zone ID (ឧ. 14309)"
                        value={formServerId}
                        onChange={(e) => {
                          setFormServerId(e.target.value);
                          setIdCheckResult(null);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCheckGameId}
                  disabled={checkingId || !formPlayerId.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkingId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>កំពុងស្វែងរកឈ្មោះតួអង្គ...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>ឆែកស្វែងរកឈ្មោះ In-game Name</span>
                    </>
                  )}
                </button>

                {idCheckResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      idCheckResult.valid
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {idCheckResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      {idCheckResult.valid ? (
                        <>
                          <div className="font-bold text-white flex items-center gap-2 flex-wrap text-sm">
                            <span>ឈ្មោះតួអង្គ (IGN)៖</span>
                            <span className="text-emerald-300 font-mono underline decoration-emerald-500/50">
                              {idCheckResult.username}
                            </span>
                            {idCheckResult.region && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {idCheckResult.region}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            ហ្គេម: {idCheckResult.gameTitle || formGame} • User ID: {formPlayerId}
                          </div>
                        </>
                      ) : (
                        <div className="font-medium">{idCheckResult.message || 'រកមិនឃើញ Player ID ឬ Zone ID មិនត្រឹមត្រូវ'}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#1e1738] text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>API Endpoint: <code>POST /api/v1/games/check-id</code></span>
                  <span>Bearer Token Auth</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
