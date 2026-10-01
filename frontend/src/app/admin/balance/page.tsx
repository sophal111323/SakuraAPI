'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  Coins,
  PlusCircle,
  MinusCircle,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Users,
  Wallet,
  ArrowRight,
  Loader2,
  FileText,
  DollarSign
} from 'lucide-react';

export default function AdminBalancePage() {
  const { token, refreshProfile } = useAuth();
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedResellerId, setSelectedResellerId] = useState('');
  const [amount, setAmount] = useState('50.00');
  const [actionType, setActionType] = useState<'ADMIN_CREDIT' | 'ADMIN_DEBIT'>('ADMIN_CREDIT');
  const [note, setNote] = useState('បញ្ចូលលុយតាមរយៈ ABA Bank Deposit');
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'https://sakuraapi.lol/api/v1';
  const getAuthToken = () => token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

  const fetchResellers = async () => {
    setLoading(true);
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/resellers?limit=100`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.items || [];
        setResellers(items);
        if (items.length > 0 && !selectedResellerId) {
          setSelectedResellerId(items[0].id);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResellerId) {
      setErrorMessage('សូមជ្រើសរើសគណនី Reseller មួយ');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('សូមបញ្ចូលចំនួនទឹកប្រាក់ដែលធំជាង 0');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setResultMessage(null);

    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/balance/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          resellerId: selectedResellerId,
          amount: parsedAmount,
          type: actionType,
          note: note.trim() || 'Manual balance adjustment',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'ការកែប្រែសមតុល្យបានបរាជ័យ');
      }

      const data = json.data || json;
      setResultMessage(data);
      fetchResellers();
      refreshProfile();
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាក្នុងការកែប្រែសមតុល្យ');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  const selectedReseller = resellers.find((r) => r.id === selectedResellerId);

  return (
    <AuthGuard redirectTo="/register" adminOnly={true}>
      <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Coins className="w-6 h-6 text-purple-400" />
                <span>គ្រប់គ្រងសមតុល្យ Reseller (Balance Manager)</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                បញ្ចូលទឹកប្រាក់ ឬកាត់ទឹកប្រាក់ពីគណនី Reseller ជាមួយការកត់ត្រា Audit Log ស្វ័យប្រវត្ត
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

          {/* Security Guarantee Banner */}
          <div className="bg-[#120e24] border border-[#261f43] rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 space-y-1">
              <span className="font-semibold text-white">ប្រព័ន្ធសុវត្ថិភាពប្រតិបត្តិការ (Immutable Ledger Guarantee):</span>
              <p className="text-zinc-400 leading-relaxed">
                រាល់ប្រតិបត្តិការបញ្ចូល ឬកាត់លុយ ត្រូវបានការពារដោយ Atomic Database Transaction និងកត់ត្រាចូលក្នុងប្រព័ន្ធ Audit Log ជាមួយនឹង ID របស់ Admin, សមតុល្យមុន និងក្រោយពេលកែប្រែ ព្រមទាំងមូលហេតុយ៉ាងច្បាស់លាស់។
              </p>
            </div>
          </div>

          {/* Form and Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                <span>អនុវត្តការបញ្ចូល ឬកាត់លុយ (Execute Adjustment)</span>
              </h2>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {resultMessage && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>សមតុល្យត្រូវបានកែប្រែដោយជោគជ័យ!</span>
                  </div>
                  <div className="text-zinc-300 font-mono text-[11px]">
                    សមតុល្យចាស់: ${parseFloat(resultMessage.previousBalance).toFixed(2)} ➔ សមតុល្យថ្មី: ${parseFloat(resultMessage.newBalance).toFixed(2)} USD
                  </div>
                </div>
              )}

              <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
                {/* Reseller Selection */}
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">ជ្រើសរើស Reseller *</label>
                  <select
                    value={selectedResellerId}
                    onChange={(e) => setSelectedResellerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    {resellers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.email}) — សមតុល្យ: ${parseFloat(r.balance).toFixed(2)} USD
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Type */}
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">ប្រភេទប្រតិបត្តិការ (Action Type) *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActionType('ADMIN_CREDIT')}
                      className={`p-3 rounded-xl border text-center transition flex items-center justify-center gap-2 ${
                        actionType === 'ADMIN_CREDIT'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-[#0b0914] border-[#2d2454] text-zinc-400'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      <span>+ បញ្ចូលលុយ (Credit)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('ADMIN_DEBIT')}
                      className={`p-3 rounded-xl border text-center transition flex items-center justify-center gap-2 ${
                        actionType === 'ADMIN_DEBIT'
                          ? 'bg-red-500/15 border-red-500 text-red-300 font-bold'
                          : 'bg-[#0b0914] border-[#2d2454] text-zinc-400'
                      }`}
                    >
                      <MinusCircle className="w-4 h-4 text-red-400" />
                      <span>- កាត់លុយ (Debit)</span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">ជ្រើសរើសចំនួនប្រាក់រហ័ស ($):</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {['5.00', '10.00', '25.00', '50.00', '100.00', '200.00', '500.00'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt)}
                        className={`py-1.5 px-2 rounded-xl border text-center font-mono font-bold text-xs transition ${
                          amount === amt
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                            : 'bg-[#0b0914] border-[#2d2454] text-zinc-300 hover:bg-[#1a1436]'
                        }`}
                      >
                        ${parseInt(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">ចំនួនទឹកប្រាក់ ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white focus:outline-none focus:border-purple-500 transition font-mono"
                  />
                </div>

                {/* Reason Note */}
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">
                    មូលហេតុ / កំណត់ចំណាំ <span className="text-amber-400 font-normal">*ចាំបាច់សម្រាប់ Audit Log</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      'ABA Bank Deposit',
                      'Wing / Bakong Deposit',
                      'Telegram Support Top-up',
                      'Bonus Promotion Top-up',
                      'Reversal / Error Refund',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNote(preset)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-[#181333] hover:bg-[#251c4a] border border-[#34275a] text-zinc-300 transition"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. ABA Bank transfer #12345, bonus top-up..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0b0914] border border-[#2d2454] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                      actionType === 'ADMIN_CREDIT'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                        : 'bg-red-600 hover:bg-red-500 shadow-red-900/30'
                    }`}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : actionType === 'ADMIN_CREDIT' ? (
                      <PlusCircle className="w-4 h-4" />
                    ) : (
                      <MinusCircle className="w-4 h-4" />
                    )}
                    <span>
                      {actionType === 'ADMIN_CREDIT'
                        ? `បញ្ជាក់ការបញ្ចូលប្រាក់ $${parseFloat(amount || '0').toFixed(2)} USD`
                        : `បញ្ជាក់ការកាត់ប្រាក់ $${parseFloat(amount || '0').toFixed(2)} USD`}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Preview Card */}
            <div className="space-y-4">
              <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-400">
                  មើលលទ្ធផលជាមុន (Live Preview)
                </h3>

                {selectedReseller ? (
                  <div className="space-y-4">
                    <div className="bg-[#0b0914] border border-[#261f47] rounded-xl p-3.5 space-y-2">
                      <div className="text-white font-bold text-sm">{selectedReseller.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{selectedReseller.email}</div>
                      {selectedReseller.companyName && (
                        <div className="text-[10px] text-purple-300">{selectedReseller.companyName}</div>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-[#1e1738]">
                        <span className="text-zinc-400">សមតុល្យបច្ចុប្បន្ន:</span>
                        <span className="font-mono font-bold text-white">
                          ${parseFloat(selectedReseller.balance || '0').toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1e1738]">
                        <span className="text-zinc-400">ប្រតិបត្តិការ:</span>
                        <span
                          className={`font-semibold ${
                            actionType === 'ADMIN_CREDIT' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {actionType === 'ADMIN_CREDIT' ? '+ បញ្ចូល (Credit)' : '- កាត់ (Debit)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1e1738]">
                        <span className="text-zinc-400">ចំនួនទឹកប្រាក់:</span>
                        <span className="font-mono font-bold text-white">
                          ${parseFloat(amount || '0').toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 bg-[#181333] px-3 rounded-xl border border-[#2b2152]">
                        <span className="text-zinc-300 font-semibold">សមតុល្យក្រោយកែប្រែ:</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          $
                          {(
                            parseFloat(selectedReseller.balance || '0') +
                            (actionType === 'ADMIN_CREDIT'
                              ? parseFloat(amount || '0')
                              : -parseFloat(amount || '0'))
                          ).toFixed(2)}{' '}
                          USD
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 py-6 text-center">
                    សូមជ្រើសរើស Reseller ដើម្បីមើលលទ្ធផល
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
