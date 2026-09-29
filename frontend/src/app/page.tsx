'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Server, 
  Database, 
  Key, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Activity,
  Cpu,
  User,
  Wallet,
  Gamepad2,
  Receipt,
  History,
  BookOpen,
  RefreshCw,
  Lock,
  Flame
} from 'lucide-react';

export default function Home() {
  const { user, reseller, logout, loading: authLoading } = useAuth();

  const [healthStatus, setHealthStatus] = useState<{
    loading: boolean;
    online: boolean;
    data: any;
    error: string | null;
  }>({
    loading: true,
    online: false,
    data: null,
    error: null,
  });

  const checkHealth = async () => {
    setHealthStatus(prev => ({ ...prev, loading: true, error: null }));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/health`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setHealthStatus({
        loading: false,
        online: true,
        data: json.data || json,
        error: null,
      });
    } catch (err: any) {
      setHealthStatus({
        loading: false,
        online: false,
        data: null,
        error: err.message || 'Cannot reach backend service',
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const phases = [
    {
      id: 'PHASE 1',
      title: 'Foundation & Core Architecture',
      desc: 'Independent SakuraAPI project setup, NestJS backend, Next.js frontend, Prisma ORM schema with 9 models, Swagger OpenAPI, and environment configs.',
      status: 'completed',
    },
    {
      id: 'PHASE 2',
      title: 'Auth & Reseller/Admin System',
      desc: 'Secure JWT authentication, bcrypt password hashing, role-based access control (ADMIN & RESELLER), and database seeders.',
      status: 'completed',
    },
    {
      id: 'PHASE 3',
      title: 'Reseller Dashboard & Catalog',
      desc: 'Live Reseller metrics dashboard, Game Categories, Products with dynamic markup calculation, Orders, Funding History, and API Key management.',
      status: 'completed',
    },
    {
      id: 'PHASE 4',
      title: 'SoraTopup Upstream Integration',
      desc: 'Upstream Provider service, automated top-up order processing, stock sync, and zero-loss auto-refund handling.',
      status: 'completed',
    },
    {
      id: 'PHASE 5',
      title: 'Admin Control Center',
      desc: 'Reseller management, manual balance credit/debit with immutable audit logs, system-wide metrics, and request monitoring.',
      status: 'completed',
    },
    {
      id: 'PHASE 6',
      title: 'Security Hardening & Rate Limiting',
      desc: 'API key SHA-256 hashing, sliding-window rate limiting (100 req/min), XSS/injection protection, audit logging, and 26 passing Vitest unit tests.',
      status: 'completed',
    },
    {
      id: 'PHASE 7',
      title: 'Production Polish & Local Verification',
      desc: 'Responsive UI audit, end-to-end testing, local run instructions, and comprehensive handover.',
      status: 'completed',
    },
  ];

  const quickLinks = [
    { label: 'Dashboard', desc: 'Real-time KPIs & order metrics', href: '/dashboard', icon: Zap, color: 'text-purple-400' },
    { label: 'Game Catalog', desc: 'Categories, items & pricing', href: '/categories', icon: Gamepad2, color: 'text-pink-400' },
    { label: 'Orders Hub', desc: 'Real-time status & auto-sync', href: '/orders', icon: Receipt, color: 'text-emerald-400' },
    { label: 'Funding Ledger', desc: 'Immutable transaction logs', href: '/funding', icon: History, color: 'text-blue-400' },
    { label: 'API Keys', desc: 'Generate & manage secret tokens', href: '/api-access', icon: Key, color: 'text-amber-400' },
    { label: 'Developer Docs', desc: 'OpenAPI guides & code samples', href: '/docs', icon: BookOpen, color: 'text-indigo-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
      {/* Shared Navigation */}
      <Navigation />

      {/* Top Ambient Glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-900/20 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative space-y-10">
        {/* User Session Banner (if logged in) */}
        {user && (
          <div className="bg-gradient-to-r from-purple-950/40 via-[#191338] to-[#120e24] border border-purple-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{user.name}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                    {user.role} Account
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {user.email} {reseller?.companyName ? `• ${reseller.companyName}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {reseller && (
                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">Available Reseller Balance</div>
                  <div className="text-xl font-extrabold text-emerald-400">
                    ${parseFloat(reseller.balance).toFixed(2)} <span className="text-xs text-zinc-500">{reseller.currency}</span>
                  </div>
                </div>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition shadow-md shadow-purple-600/20 flex items-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>SakuraAPI • Automated Game Top-up Reseller Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Enterprise Top-up API <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300">
              For Game Stock Resellers
            </span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            SakuraAPI connects downstream resellers seamlessly to upstream stock via SoraTopup API with automated balance ledger, sliding-window rate limiting, and zero-loss order processing.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs sm:text-sm transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <span>Access Reseller Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="px-5 py-2.5 rounded-xl bg-[#16122d] hover:bg-[#201844] border border-[#352963] text-zinc-300 font-medium text-xs sm:text-sm transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>API Documentation</span>
            </Link>
          </div>
        </section>

        {/* Quick Portal Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group p-5 rounded-2xl bg-[#130f26] border border-[#2b2252] hover:border-purple-500/50 hover:bg-[#181335] transition duration-200 shadow-md space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-[#1c163b] border border-[#372b68] ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">{item.label}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </section>

        {/* 3-Tier Architecture Flow */}
        <section className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Cpu className="w-48 h-48 text-purple-400" />
          </div>

          <h2 className="text-xs uppercase font-semibold tracking-wider text-purple-400 mb-6">
            Core Transaction Pipeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Step 1 */}
            <div className="bg-[#1a1436] border border-[#352963] p-5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">01</span>
                <Key className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-semibold text-sm text-white">Reseller Request</h3>
              <p className="text-xs text-zinc-400">
                Resellers authenticate using their unique live API key: <code className="text-purple-300 font-mono text-[11px]">Bearer sk_live_...</code>
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#201844] border-2 border-purple-500/40 p-5 rounded-xl space-y-2 shadow-lg shadow-purple-600/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">02</span>
                <ShieldCheck className="w-4 h-4 text-pink-400" />
              </div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                SakuraAPI Gateway
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Core</span>
              </h3>
              <p className="text-xs text-zinc-300">
                Validates idempotency, atomic balance reservation, rate limit checks, and price markup calculation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#1a1436] border border-[#352963] p-5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">03</span>
                <Server className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-semibold text-sm text-white">SoraTopup API</h3>
              <p className="text-xs text-zinc-400">
                Dispatches upstream top-up order securely: <code className="text-zinc-300 font-mono text-[11px]">soratopup.com/api/v1</code>
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#1a1436] border border-[#352963] p-5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">04</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-sm text-white">Player Fulfilled</h3>
              <p className="text-xs text-zinc-400">
                Player account credited instantly. Reseller receives standardized JSON confirmation.
              </p>
            </div>
          </div>
        </section>

        {/* Live Diagnostics & System Health */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Backend API Gateway */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Server className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">NestJS Backend</h3>
                  <p className="text-xs text-zinc-400">REST API & Swagger</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
            <div className="space-y-1 text-xs text-zinc-400">
              <div className="flex justify-between py-1 border-b border-[#231b40]">
                <span>Base URL:</span>
                <span className="font-mono text-zinc-200">http://localhost:4000/api/v1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#231b40]">
                <span>Swagger Docs:</span>
                <a href="http://localhost:4000/api/docs" target="_blank" rel="noreferrer" className="font-mono text-purple-300 hover:underline">
                  /api/docs
                </a>
              </div>
              <div className="flex justify-between py-1">
                <span>Auth System:</span>
                <span className="text-emerald-400 font-medium">JWT & Dual API Key Guard</span>
              </div>
            </div>
          </div>

          {/* Card 2: Database & Prisma */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Database className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">PostgreSQL & Prisma</h3>
                  <p className="text-xs text-zinc-400">ORM & Schema Models</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Seeder Ready
              </span>
            </div>
            <div className="space-y-1 text-xs text-zinc-400">
              <div className="flex justify-between py-1 border-b border-[#231b40]">
                <span>Balance Precision:</span>
                <span className="font-mono text-emerald-400">DECIMAL(14, 4)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#231b40]">
                <span>Models Configured:</span>
                <span className="text-zinc-200">9 Core Entities</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Demo Accounts:</span>
                <span className="text-zinc-200">Admin + Reseller Seeded</span>
              </div>
            </div>
          </div>

          {/* Card 3: Interactive Health Ping */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Health Ping Tester</h3>
                  <p className="text-xs text-zinc-400">Live API verification</p>
                </div>
              </div>
              <button
                onClick={checkHealth}
                disabled={healthStatus.loading}
                className="p-1.5 rounded-lg bg-[#1f1742] hover:bg-[#2c215e] text-purple-300 transition text-xs flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthStatus.loading ? 'animate-spin' : ''}`} />
                Ping
              </button>
            </div>
            <div className="bg-[#0b0914] p-3 rounded-lg border border-[#231b40] font-mono text-[11px] text-zinc-300">
              {healthStatus.loading ? (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Pinging /api/v1/health...
                </div>
              ) : healthStatus.online ? (
                <div className="space-y-1 text-emerald-400">
                  <div>✓ Response: HTTP 200 OK</div>
                  <div className="text-zinc-400">Service: {healthStatus.data?.service || 'SakuraAPI'}</div>
                  <div className="text-zinc-400">Uptime: {Math.round(healthStatus.data?.uptime || 0)}s</div>
                </div>
              ) : (
                <div className="space-y-1 text-amber-400">
                  <div>⚡ Backend standby or starting</div>
                  <div className="text-zinc-500 text-[10px]">Start backend: <span className="text-zinc-300">npm run dev:backend</span></div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Phase Progress Roadmap */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Development Roadmap Status</h2>
              <p className="text-xs text-zinc-400">All 7 architecture phases implemented and verified</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              All 7 Phases Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className="p-5 rounded-xl border bg-gradient-to-br from-[#1b1238] to-[#120e24] border-purple-500/40 shadow-lg shadow-purple-600/10 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {phase.id}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{phase.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{phase.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#221c3b] bg-[#0c0919] mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>🌸 SakuraAPI Reseller Platform</span>
            <span>•</span>
            <span className="text-purple-400">All Phases Ready</span>
          </div>
          <div>
            Upstream Provider: <span className="text-purple-400 font-mono">soratopup.com/api/v1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
