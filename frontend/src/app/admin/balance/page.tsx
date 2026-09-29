'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
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
  FileText
} from 'lucide-react';

export default function AdminBalancePage() {
  const { token, refreshProfile } = useAuth();
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedResellerId, setSelectedResellerId] = useState('');
  const [amount, setAmount] = useState('50.00');
  const [actionType, setActionType] = useState<'ADMIN_CREDIT' | 'ADMIN_DEBIT'>('ADMIN_CREDIT');
  const [note, setNote] = useState('Manual balance adjustment');
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchResellers = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      if (!authToken) {
        setResellers([
          { id: 'res-demo-1', name: 'Demo Reseller', email: 'reseller@sakuraapi.com', balance: '100.00' },
        ]);
        setSelectedResellerId('res-demo-1');
        setLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/admin/resellers?limit=50`, {
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
      setErrorMessage('Please select a reseller');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setResultMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

      const res = await fetch(`${apiUrl}/admin/balance/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          resellerId: selectedResellerId,
          amount: parseFloat(amount),
          type: actionType,
          note: note.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Balance adjustment failed');
      }

      const data = json.data || json;
      setResultMessage(data);
      fetchResellers();
      refreshProfile();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  const selectedReseller = resellers.find((r) => r.id === selectedResellerId);

  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Coins className="w-6 h-6 text-purple-400" />
              <span>Admin Balance Management</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Add or remove funds from reseller accounts with mandatory audit justifications.
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

        {/* Security Rule Banner */}
        <div className="bg-[#120e24] border border-[#261f43] rounded-2xl p-4 flex items-start gap-3 shadow-lg">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 space-y-1">
            <span className="font-semibold text-white">Immutable Ledger Guarantee:</span>
            <p className="text-zinc-400 leading-relaxed">
              Every balance modification is executed in a single atomic database transaction. SakuraAPI never modifies a reseller balance without recording the transaction ID, admin ID, previous balance, new balance, and reason note.
            </p>
          </div>
        </div>

        {/* Adjuster Form and Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form (2 cols) */}
          <div className="lg:col-span-2 bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Execute Balance Modification</span>
            </h2>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {resultMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Balance Updated Successfully</span>
                </div>
                <div className="text-zinc-300 font-mono text-[11px]">
                  Previous Balance: ${parseFloat(resultMessage.previousBalance).toFixed(2)} ➔ New Balance: ${parseFloat(resultMessage.newBalance).toFixed(2)}
                </div>
              </div>
            )}

            <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Select Reseller</label>
                <select
                  value={selectedResellerId}
                  onChange={(e) => setSelectedResellerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white focus:outline-none focus:border-purple-500 transition"
                >
                  {resellers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.email}) — Balance: ${parseFloat(r.balance).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Action Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType('ADMIN_CREDIT')}
                    className={`p-3 rounded-xl border text-center transition flex items-center justify-center gap-2 ${
                      actionType === 'ADMIN_CREDIT'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold'
                        : 'bg-[#0b0914] border-[#2d2454] text-zinc-400'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Add Balance (Credit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('ADMIN_DEBIT')}
                    className={`p-3 rounded-xl border text-center transition flex items-center justify-center gap-2 ${
                      actionType === 'ADMIN_DEBIT'
                        ? 'bg-red-500/15 border-red-500 text-red-300 font-semibold'
                        : 'bg-[#0b0914] border-[#2d2454] text-zinc-400'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4 text-red-400" />
                    <span>Deduct Balance (Debit)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Adjustment Amount ($ USD)</label>
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

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  Audit Reason / Note <span className="text-amber-400 font-normal">*Mandatory for audit logs</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Bank transfer deposit #4892, or promotional top-up bonus"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Atomic Balance Update...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Execute Balance Adjustment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary Preview Card */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 shadow-xl space-y-5 h-fit">
            <h3 className="text-sm font-bold text-white">Live Calculation Preview</h3>

            {selectedReseller ? (
              <div className="space-y-4 text-xs">
                <div className="bg-[#0b0914] p-3.5 rounded-xl border border-[#231b40] space-y-2">
                  <div className="text-zinc-400">Selected Reseller:</div>
                  <div className="font-bold text-white text-sm">{selectedReseller.name}</div>
                  <div className="font-mono text-zinc-400 text-[11px]">{selectedReseller.email}</div>
                </div>

                <div className="bg-[#0b0914] p-3.5 rounded-xl border border-[#231b40] space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Current Balance:</span>
                    <span className="font-mono text-white font-semibold">
                      ${parseFloat(selectedReseller.balance || '0').toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-400">
                      {actionType === 'ADMIN_CREDIT' ? 'Credit Amount:' : 'Debit Amount:'}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        actionType === 'ADMIN_CREDIT' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {actionType === 'ADMIN_CREDIT' ? '+' : '-'}${parseFloat(amount || '0').toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#1e1738] flex justify-between text-sm">
                    <span className="font-bold text-white">Projected Balance:</span>
                    <span className="font-mono font-extrabold text-purple-300">
                      $
                      {(
                        parseFloat(selectedReseller.balance || '0') +
                        (actionType === 'ADMIN_CREDIT' ? parseFloat(amount || '0') : -parseFloat(amount || '0'))
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">Select a reseller to view projection</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
