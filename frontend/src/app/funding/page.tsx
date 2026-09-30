'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Wallet,
  RefreshCw,
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
  Sparkles,
  ArrowRight,
  Smartphone,
  Copy,
  Check,
  Loader2,
  AlertCircle
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

interface KhqrData {
  tran_id: string;
  amount: string;
  currency: string;
  qr_string: string;
  deeplink: string;
  checkout_url: string;
  download_qr?: string;
  expire_in_sec: number;
}

export default function FundingPage() {
  const { user, reseller, token, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Deposit Modal & KHQR state
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('5.00');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [khqrData, setKhqrData] = useState<KhqrData | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [copiedQr, setCopiedQr] = useState(false);

  // Countdown timer for KHQR
  const [countdown, setCountdown] = useState<number>(180);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTransactions = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
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
    const interval = setInterval(() => {
      fetchTransactions(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [typeFilter, token]);

  // Handle KHQR Generation
  const handleGenerateKhqr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amt = parseFloat(customAmount || depositAmount);
    if (isNaN(amt) || amt < 0.1) {
      setDepositError('សូមបញ្ចូលទឹកប្រាក់ចាប់ពី $0.10 ឡើងទៅ');
      return;
    }

    setIsGeneratingQr(true);
    setDepositError(null);
    setPaymentSuccess(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      const res = await fetch(`${apiUrl}/funding/create-khqr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ amount: amt }),
      });

      const json = await res.json();
      if (!res.ok || !json.data?.qr_string) {
        throw new Error(json.error?.message || json.message || 'មិនអាចបង្កើត KHQR បានទេ');
      }

      const qrDetails = json.data || json;
      setKhqrData(qrDetails);
      setCountdown(qrDetails.expire_in_sec || 180);

      // Trigger mobile banking app deep link if on mobile device
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && qrDetails.deeplink) {
        window.location.href = qrDetails.deeplink;
      }
    } catch (err: any) {
      setDepositError(err.message || 'មានបញ្ហាក្នុងការបង្កើត KHQR សូមព្យាយាមម្តងទៀត');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // Timer & Real-time Payment Status Checker
  useEffect(() => {
    if (!khqrData || paymentSuccess) {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const pollPayment = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

        const res = await fetch(`${apiUrl}/funding/check-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ tran_id: khqrData.tran_id }),
        });

        const json = await res.json();
        const resData = json.data || json;

        if (resData.paid) {
          setPaymentSuccess(resData);
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          fetchTransactions();
          refreshProfile();
        }
      } catch {
        // Continue polling
      }
    };

    checkIntervalRef.current = setInterval(pollPayment, 3000);

    return () => {
      clearInterval(timer);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [khqrData, paymentSuccess]);

  const copyQrString = () => {
    if (khqrData?.qr_string) {
      navigator.clipboard.writeText(khqrData.qr_string);
      setCopiedQr(true);
      setTimeout(() => setCopiedQr(false), 2000);
    }
  };

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'ADMIN_CREDIT':
        return { label: 'បញ្ចូលលុយ (Deposit)', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'ADMIN_DEBIT':
        return { label: 'កាត់ប្រាក់ (Admin Debit)', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'ORDER_PAYMENT':
        return { label: 'កាត់ប្រាក់បញ្ជាទិញ (Order)', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'ORDER_REFUND':
        return { label: 'បង្វិលសងវិញ (Refund)', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      default:
        return { label: 'កែសម្រួល (Adjustment)', color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' };
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <AuthGuard redirectTo="/register">
      <div className="min-h-screen bg-[#080510] text-[#f1f0f7] selection:bg-pink-500 selection:text-white relative">
        <Navigation />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-purple-900/15 via-pink-600/5 to-transparent blur-3xl pointer-events-none" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#221c3b] animate-slide-up-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>ប្រវត្តិបញ្ចូលសមតុល្យ & ប្រតិបត្តិការ (Funding Ledger)</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                    Immutable
                  </span>
                </h1>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>ទិន្នន័យផ្សាយផ្ទាល់ (Live 4s)</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                រាល់ការបញ្ចូលទឹកប្រាក់ ការកាត់ប្រាក់កុម្ម៉ង់ និងការបង្វិលសងស្វ័យប្រវត្តិ ត្រូវបានកត់ត្រាទុកយ៉ាងមានសុវត្ថិភាព។
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#130d28] border border-[#2e2056] text-xs shadow-sm">
                <Wallet className="w-4 h-4 text-purple-400" />
                <span className="text-zinc-400 font-medium">សមតុល្យបច្ចុប្បន្ន:</span>
                <span className="font-extrabold text-white text-sm">
                  ${parseFloat(reseller?.balance || '0.00').toFixed(2)}
                </span>
                <span className="text-[10px] text-pink-400 font-bold uppercase">{reseller?.currency || 'USD'}</span>
              </div>

              <button
                onClick={() => {
                  setKhqrData(null);
                  setPaymentSuccess(null);
                  setDepositError(null);
                  setDepositModalOpen(true);
                }}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 flex items-center gap-2 transition active:scale-95 whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>បញ្ចូលសមតុល្យ (Deposit KHQR)</span>
              </button>

              <button
                onClick={() => fetchTransactions(false)}
                disabled={loading}
                title="ទាញយកទិន្នន័យថ្មី"
                className="p-2.5 rounded-2xl bg-[#130d28] hover:bg-[#201642] border border-[#2e2056] text-zinc-300 hover:text-white transition disabled:opacity-50 active:scale-95 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Ledger Security Guarantee */}
          <div className="bg-[#120d26]/80 border border-[#291f4d] rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-zinc-400 animate-slide-up-2 shadow-lg">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                រាល់ប្រតិបត្តិការទាំងអស់ត្រូវបានការពារដោយប្រព័ន្ធសុវត្ថិភាព <strong>PostgreSQL Atomic Row Locks</strong> គ្មានការបាត់បង់ទិន្នន័យ ឬបាត់ប្រាក់ឡើយ។
              </span>
            </div>
            <span className="font-mono text-purple-300 text-[11px] shrink-0 hidden sm:inline font-bold">
              DECIMAL(14, 4)
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 animate-slide-up-3 scrollbar-none">
            {[
              { id: 'ALL', label: 'ប្រតិបត្តិការទាំងអស់ (All)' },
              { id: 'ADMIN_CREDIT', label: 'បញ្ចូលលុយ (Deposit)' },
              { id: 'ORDER_PAYMENT', label: 'កាត់ប្រាក់បញ្ជាទិញ (Orders)' },
              { id: 'ORDER_REFUND', label: 'បង្វិលសងវិញ (Refunds)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                    : 'bg-[#120d26] border border-[#2b2052] text-zinc-400 hover:text-white hover:bg-[#1a1238]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transactions Table */}
          <div className="bg-[#120d26]/90 border border-[#2b2252] rounded-3xl overflow-hidden shadow-xl animate-slide-up-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e0920] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#251b46]">
                  <tr>
                    <th className="py-3.5 px-4">លេខកូដប្រតិបត្តិការ (Tx ID)</th>
                    <th className="py-3.5 px-4">ប្រភេទ</th>
                    <th className="py-3.5 px-4">ទឹកប្រាក់</th>
                    <th className="py-3.5 px-4">សមតុល្យចាស់</th>
                    <th className="py-3.5 px-4">សមតុល្យថ្មី</th>
                    <th className="py-3.5 px-4">ស្ថានភាព</th>
                    <th className="py-3.5 px-4">កំណត់ចំណាំ</th>
                    <th className="py-3.5 px-4">កាលបរិច្ឆេទ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e153b]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-pink-400" />
                          <span>កំពុងទាញទិន្នន័យប្រតិបត្តិការ...</span>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx) => {
                      const badge = getTypeBadge(tx.type);
                      const isCredit = parseFloat(tx.amount) > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-[#181136] transition">
                          <td className="py-3.5 px-4 font-mono font-semibold text-purple-300">
                            {tx.transactionNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}
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
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                tx.status === 'COMPLETED'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : tx.status === 'PENDING'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-red-500/15 text-red-400 border-red-500/30'
                              }`}
                            >
                              {tx.status === 'COMPLETED' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Clock className="w-3 h-3 text-amber-400" />
                              )}
                              <span>{tx.status === 'COMPLETED' ? 'ជោគជ័យ' : tx.status === 'PENDING' ? 'កំពុងរង់ចាំ' : 'បរាជ័យ'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-300 text-[11px] max-w-xs truncate font-sans">
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
                        មិនទាន់មានប្រវត្តិប្រតិបត្តិការនៅឡើយទេ។
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Deposit Funds via PayWay KHQR */}
          {depositModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#120e24] border border-[#2b2252] rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150 relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#221c3b]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5">
                      <div className="w-full h-full bg-[#120e24] rounded-[14px] flex items-center justify-center text-pink-300">
                        <QrCode className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">បញ្ចូលសមតុល្យតាម KHQR (PayWay)</h3>
                      <p className="text-[11px] text-zinc-400">ស្កេនទូទាត់ជាមួយគ្រប់ធនាគារក្នុងប្រទេសកម្ពុជា</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDepositModalOpen(false);
                      setKhqrData(null);
                      setPaymentSuccess(null);
                    }}
                    className="p-1 rounded-lg hover:bg-[#201844] text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* State 1: Payment Success Screen */}
                {paymentSuccess ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-9 h-9 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-extrabold text-white">ការបញ្ចូលទឹកប្រាក់ជោគជ័យ!</h4>
                      <p className="text-xs text-zinc-300">
                        សមតុល្យចំនួន <strong className="text-emerald-400 font-mono text-sm">+${paymentSuccess.amount} USD</strong> ត្រូវបានបញ្ចូលទៅក្នុងកាបូបរបស់អ្នករួចរាល់ហើយ។
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#171032] border border-[#2e2056] text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between text-zinc-400">
                        <span>លេខកូដសម្គាល់:</span>
                        <span className="text-purple-300 font-bold">{paymentSuccess.tran_id || khqrData?.tran_id}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>សមតុល្យថ្មីក្នុងកាបូប:</span>
                        <span className="text-emerald-400 font-bold">${parseFloat(paymentSuccess.newBalance || '0').toFixed(2)} USD</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setDepositModalOpen(false);
                        setKhqrData(null);
                        setPaymentSuccess(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition active:scale-95"
                    >
                      បិទផ្ទាំង (រួចរាល់)
                    </button>
                  </div>
                ) : khqrData ? (
                  /* State 2: Display Generated KHQR Screen */
                  <div className="space-y-4">
                    {/* KHQR Card Display */}
                    <div className="bg-white rounded-3xl p-5 text-zinc-900 shadow-2xl space-y-3 relative overflow-hidden">
                      {/* Top Red KHQR Header */}
                      <div className="bg-[#E11925] -mx-5 -mt-5 px-5 py-3 flex items-center justify-between text-white">
                        <div className="font-extrabold tracking-wider text-base flex items-center gap-1.5">
                          <span>KHQR</span>
                        </div>
                        <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full uppercase">
                          PayWay ABA
                        </span>
                      </div>

                      <div className="text-center pt-1">
                        <div className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                          SAKURA API / TANG SOVANN
                        </div>
                        <div className="text-2xl font-black text-zinc-900 mt-0.5">
                          ${parseFloat(khqrData.amount).toFixed(2)} <span className="text-sm font-semibold text-zinc-500">USD</span>
                        </div>
                      </div>

                      {/* Actual QR Code SVG generated from qr_string */}
                      <div className="flex items-center justify-center p-3 bg-white rounded-2xl border-2 border-zinc-100 shadow-inner">
                        <QRCodeSVG
                          value={khqrData.qr_string}
                          size={210}
                          level="M"
                          includeMargin={false}
                        />
                      </div>

                      {/* Instructions under QR */}
                      <div className="text-center space-y-1">
                        <div className="text-[11px] font-semibold text-zinc-700 flex items-center justify-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#E11925]" />
                          <span>ស្កេនជាមួយ App ធនាគារណាក៏បាន (Bakong / KHQR)</span>
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          លេខកូដ: {khqrData.tran_id}
                        </div>
                      </div>
                    </div>

                    {/* Timer & Live Status Check */}
                    <div className="p-3.5 rounded-2xl bg-[#171032] border border-[#2e2056] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-zinc-300 font-medium">កំពុងរង់ចាំការទូទាត់...</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-pink-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatCountdown(countdown)}</span>
                      </div>
                    </div>

                    {/* Action buttons on QR Screen */}
                    <div className="flex items-center gap-2.5">
                      {khqrData.deeplink && (
                        <a
                          href={khqrData.deeplink}
                          className="flex-1 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#0a9396] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>បើកក្នុង ABA Mobile</span>
                        </a>
                      )}

                      <button
                        onClick={copyQrString}
                        className="px-3.5 py-2.5 rounded-xl bg-[#1d163e] hover:bg-[#291f54] border border-[#3b2d6d] text-purple-200 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
                      >
                        {copiedQr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedQr ? 'បានចម្លង' : 'ចម្លង QR String'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setKhqrData(null)}
                      className="w-full text-center text-xs text-zinc-400 hover:text-white transition py-1"
                    >
                      ← ជ្រើសរើសចំនួនទឹកប្រាក់ផ្សេង
                    </button>
                  </div>
                ) : (
                  /* State 3: Enter Amount Form */
                  <form onSubmit={handleGenerateKhqr} className="space-y-4 text-xs">
                    {depositError && (
                      <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{depositError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-2">
                        ជ្រើសរើសចំនួនទឹកប្រាក់រហ័ស (Quick Select)៖
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['1.00', '5.00', '10.00', '20.00', '50.00', '100.00'].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setDepositAmount(amt);
                              setCustomAmount('');
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                              depositAmount === amt && !customAmount
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-500 shadow-md shadow-pink-600/30'
                                : 'bg-[#16102e] border-[#2e2254] text-zinc-300 hover:text-white hover:bg-[#221845]'
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1.5">
                        ឬបញ្ចូលចំនួនទឹកប្រាក់ផ្ទាល់ខ្លួន ($ USD)៖
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.10"
                          placeholder="ឧ. 15.00"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setDepositError(null);
                          }}
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#0b0818] border border-[#2d2054] text-white text-sm font-bold placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition"
                        />
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="p-3.5 rounded-2xl bg-[#16102e] border border-[#2e2254] space-y-1 text-zinc-400 text-[11px] leading-relaxed">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>ស្វ័យប្រវត្តិ ១០០% គ្មានរង់ចាំ Admin អនុម័តឡើយ</span>
                      </div>
                      <p>
                        បន្ទាប់ពីលោកអ្នកស្កេនទូទាត់ជោគជ័យ ប្រព័ន្ធនឹងបញ្ចូលទឹកប្រាក់ទៅក្នុង Balance Reseller របស់អ្នកភ្លាមៗក្នុងរយៈពេលក្រោម ២ វិនាទី។
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isGeneratingQr}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                    >
                      {isGeneratingQr ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>កំពុងបង្កើត KHQR Code...</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4" />
                          <span>បង្កើត KHQR ដើម្បីស្កេនទូទាត់ (${customAmount || depositAmount} USD)</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
