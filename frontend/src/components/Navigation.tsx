'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Gamepad2,
  Receipt,
  History,
  Key,
  BookOpen,
  LogOut,
  Wallet,
  Menu,
  X,
  ShieldCheck,
  Users,
  Coins,
  Activity,
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, reseller, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const resellerNavItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard, exact: true },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Categories', href: '/categories', icon: Gamepad2 },
    { label: 'Orders', href: '/orders', icon: Receipt },
    { label: 'Funding', href: '/funding', icon: History },
    { label: 'API Access', href: '/api-access', icon: Key },
    { label: 'API Docs', href: '/docs', icon: BookOpen },
  ];

  const adminNavItems = [
    { label: 'Admin Overview', href: '/admin', icon: ShieldCheck, exact: true },
    { label: 'Resellers', href: '/admin/resellers', icon: Users },
    { label: 'Balance Manager', href: '/admin/balance', icon: Coins },
    { label: 'Request Logs', href: '/admin/logs', icon: Activity },
    { label: 'Reseller Portal', href: '/dashboard', icon: LayoutDashboard },
  ];

  const navItems = isAdmin ? adminNavItems : resellerNavItems;

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#221c3b] bg-[#0f0c1d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link href="/" className="flex items-center space-x-2 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-sky-400 shadow-lg shadow-purple-600/30 overflow-hidden flex items-center justify-center bg-[#0e0a1f] shrink-0">
                <img src="/logo.png" alt="SakuraAPI Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1 whitespace-nowrap">
                Sakura<span className="text-pink-400">API</span>
                {isAdmin && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Admin
                  </span>
                )}
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      active
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-[#1a1436]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    {reseller && (
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/60 to-[#191338] border border-purple-600/30 text-xs shadow-inner whitespace-nowrap">
                        <Wallet className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="font-semibold text-white">
                          ${parseFloat(reseller.balance).toFixed(2)}
                        </span>
                        <span className="hidden sm:inline text-[10px] text-zinc-400">{reseller.currency}</span>
                      </div>
                    )}
                    <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#181330] border border-[#2d2454] text-xs whitespace-nowrap">
                      <span className="text-white font-medium">{user.name}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          user.role === 'ADMIN'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      title="Sign Out"
                      className="hidden sm:flex p-1.5 rounded-xl bg-[#181330] hover:bg-red-500/20 border border-[#2d2454] hover:border-red-500/30 text-zinc-400 hover:text-red-300 transition"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Link
                      href="/login"
                      className="px-3 py-1.5 rounded-xl bg-[#181330] hover:bg-[#231b45] border border-[#2d2454] text-zinc-200 text-xs font-semibold whitespace-nowrap transition text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold whitespace-nowrap transition shadow-md shadow-purple-600/30 text-center"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#181330] hover:bg-[#231b45] text-zinc-300 border border-[#2d2454] transition shrink-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-[#221c3b] space-y-2 animate-in fade-in duration-150">
            {!user ? (
              <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-[#221c3b]">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-[#181330] border border-[#2d2454] text-center text-xs font-semibold text-zinc-200 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-center text-xs font-semibold text-white transition shadow-md shadow-purple-600/30"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#181330] border border-[#2d2454] mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs font-semibold">{user.name}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                {reseller && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-purple-300">
                    <Wallet className="w-3.5 h-3.5 text-purple-400" />
                    <span>${parseFloat(reseller.balance).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                      active
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-[#1a1436]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {user && (
              <div className="pt-2 border-t border-[#221c3b]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out (ចាកចេញ)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
