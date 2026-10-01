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
  redirectTo,
  adminOnly = false,
}: AuthGuardProps) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const destination = redirectTo || (adminOnly ? '/admin/sakuraapi030511' : '/register');

  useEffect(() => {
    if (!loading) {
      if (!user && !token) {
        router.replace(destination);
      } else if (adminOnly && user && user.role !== 'ADMIN') {
        router.replace('/dashboard');
      }
    }
  }, [user, token, loading, router, destination, adminOnly]);

  // While checking auth state or if user has no account, display smooth loading screen
  if (loading || (!user && !token)) {
    return (
      <div className="min-h-screen bg-[#080510] text-[#f1f0f7] flex flex-col items-center justify-center space-y-4 px-4 selection:bg-pink-500 selection:text-white">
        <div className="relative">
          <img
            src="/logo.png"
            alt="SakuraAPI"
            className="h-12 sm:h-14 w-auto object-contain filter drop-shadow-[0_0_16px_rgba(236,72,153,0.5)] animate-pulse"
          />
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
