'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  adminOnly?: boolean;
}

export default function AuthGuard({
  children,
  redirectTo = '/register',
  adminOnly = false,
}: AuthGuardProps) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user && !token) {
        router.replace(redirectTo);
      } else if (adminOnly && user && user.role !== 'ADMIN') {
        router.replace('/dashboard');
      }
    }
  }, [user, token, loading, router, redirectTo, adminOnly]);

  // While checking auth state or if user has no account, display smooth loading screen
  if (loading || (!user && !token)) {
    return (
      <div className="min-h-screen bg-[#080510] text-[#f1f0f7] flex flex-col items-center justify-center space-y-4 px-4 selection:bg-pink-500 selection:text-white">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-sky-400 p-0.5 shadow-2xl shadow-purple-600/40 animate-pulse">
            <div className="w-full h-full bg-[#0e0a1f] rounded-[14px] flex items-center justify-center p-2.5">
              <img src="/logo.png" alt="SakuraAPI" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-purple-300 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
          <span>កំពុងផ្ទៀងផ្ទាត់គណនី...</span>
        </div>
      </div>
    );
  }

  // If page is admin-only but user is not admin
  if (adminOnly && user?.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
