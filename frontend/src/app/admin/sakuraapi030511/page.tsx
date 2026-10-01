'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Key,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useAuth } from '@/context/AuthContext';

export default function SecretAdminLoginPage() {
  const router = useRouter();
  const { login, verifyAdmin2fa, resendAdmin2fa, user } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2FA State
  const [step2FA, setStep2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [adminTelegramId, setAdminTelegramId] = useState('7301310227');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Redirect if already logged in as Admin
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, router]);

  // 5-minute Countdown Timer
  useEffect(() => {
    if (!step2FA) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step2FA, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await login(email.trim(), password);

      if (res.requires2FA) {
        setTempToken(res.tempToken || '');
        setAdminTelegramId(res.adminTelegramId || '7301310227');
        setTimeLeft(res.expiresIn || 300);
        setStep2FA(true);
        setSubmitting(false);
        return;
      }

      if (res.success) {
        router.push('/admin');
      } else {
        setErrorMessage(res.error || 'ការចូលគណនីបានបរាជ័យ');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាក្នុងការតភ្ជាប់');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setErrorMessage('សូមបញ្ចូលលេខកូដ 2FA (6 ខ្ទង់) ឬ 256-Character Secret Key');
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await verifyAdmin2fa(tempToken, twoFactorCode.trim());
      if (res.success) {
        router.push('/admin');
      } else {
        setErrorMessage(res.error || 'លេខកូដ 2FA ឬ Secret Key មិនត្រឹមត្រូវឡើយ');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់ 2FA');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend2FA = async () => {
    if (resending || timeLeft > 270) return; // 30s cooldown
    setResending(true);
    setErrorMessage(null);
    setResendSuccess(false);

    try {
      const res = await resendAdmin2fa(tempToken);
      if (res.success) {
        setTimeLeft(300);
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 4000);
      } else {
        setErrorMessage(res.error || 'បរាជ័យក្នុងការផ្ញើកូដឡើងវិញ');
      }
    } catch {
      setErrorMessage('មានបញ្ហាក្នុងការផ្ញើកូដឡើងវិញ');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06040d] text-[#f1f0f7] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-pink-500 selection:text-white">
      {/* Animated Cyber Background */}
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3 animate-slide-up-1">
          <Link href="/" className="inline-block group transition-transform duration-300 hover:scale-105">
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 shadow-2xl shadow-amber-600/30">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#0c081c] flex items-center justify-center p-1.5">
                <img
                  src="/logo.png"
                  alt="SakuraAPI"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]"
                />
              </div>
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-amber-500/30 to-purple-500/30 blur-lg -z-10 group-hover:blur-xl transition" />
            </div>
          </Link>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal &bull; Restricted</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {step2FA ? 'ផ្ទៀងផ្ទាត់ 2FA & Secret Key' : 'SakuraAPI Admin Access'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {step2FA
                ? `លេខកូដសុវត្ថិភាពត្រូវបានបញ្ជូនទៅកាន់ Telegram Bot (ID: ${adminTelegramId})`
                : 'ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធផ្ទៃក្នុង (Internal Administration Control)'}
            </p>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-[#100a22]/90 backdrop-blur-xl border border-[#2d1e56] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/60 space-y-6 relative overflow-hidden animate-slide-up-2">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* ========================================================= */}
          {/* STEP 2: 2FA & ROTATING 256-CHAR SECRET KEY */}
          {/* ========================================================= */}
          {step2FA ? (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gradient-to-r from-purple-950/60 to-[#181236] border border-purple-500/30 rounded-2xl p-4 flex items-start gap-3 shadow-inner">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Admin 2FA Verification Active</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    យើងបានផ្ញើ <b className="text-pink-300">លេខកូដ 6 ខ្ទង់</b> និង <b className="text-purple-300">Secret Key 256 តួអក្សរ</b> ទៅកាន់ Telegram Bot របស់អ្នក (Admin ID: <code className="text-emerald-400 font-mono">{adminTelegramId}</code>)។
                  </p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#080514] border border-[#281a4a] text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>សុពលភាពនៅសល់:</span>
                </div>
                <div className={`font-mono font-bold text-sm ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Resend Success Alert */}
              {resendSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>កូដ 2FA ថ្មី និង 256-Char Secret Key ត្រូវបានផ្ញើរួចរាល់!</span>
                </div>
              )}

              {/* 2FA Form */}
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <label className="block text-zinc-300 font-medium text-xs mb-1.5">
                    បញ្ចូលលេខកូដ 2FA (6 ខ្ទង់) ឬ 256-Character Secret Key:
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <textarea
                      rows={2}
                      required
                      autoFocus
                      disabled={timeLeft === 0 || submitting}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="e.g. 123456 ឬ paste 256-char secret key..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080514] border border-[#2d1e56] text-sm text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-500 disabled:opacity-50 transition"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    អ្នកអាចបញ្ចូលលេខកូដ 6 ខ្ទង់ ឬចម្លង 256-character secret key ពី Telegram Bot មកដាក់ក៏បាន។
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || timeLeft === 0}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>ផ្ទៀងផ្ទាត់ & ចូល Admin Panel</span>
                </button>
              </form>

              {/* Resend & Back buttons */}
              <div className="pt-2 border-t border-[#231742] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep2FA(false);
                    setErrorMessage(null);
                  }}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>ត្រឡប់ក្រោយ</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend2FA}
                  disabled={resending || timeLeft > 270}
                  className="text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1 transition disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'កំពុងផ្ញើ...' : 'ផ្ញើកូដម្តងទៀត'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* STEP 1: ADMIN EMAIL & PASSWORD */
            /* ========================================================= */
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-fade-in">
              <div className="bg-[#170e30]/80 border border-[#2d1e56] rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-zinc-300">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>គណនី Administrator ត្រូវបានការពារដោយ 2FA & 256-Bit Rotating Secret Key</span>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-zinc-300 font-medium text-xs mb-1.5">Email គណនី Admin *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kanhatepi2011@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080514] border border-[#2d1e56] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium text-xs mb-1.5">Password សម្ងាត់ *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#080514] border border-[#2d1e56] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                <span>បន្តទៅកាន់ការផ្ទៀងផ្ទាត់ 2FA</span>
              </button>
            </form>
          )}
        </div>

        {/* Security badge */}
        <div className="text-center text-[11px] text-zinc-500 space-y-1">
          <p>SakuraAPI Internal Secure Gateway &bull; Rate Limit Protected</p>
          <p className="text-[10px] text-zinc-600">sakuraapi.lol &copy; 2026. រក្សាសិទ្ធិគ្រប់យ៉ាង</p>
        </div>
      </div>
    </div>
  );
}
