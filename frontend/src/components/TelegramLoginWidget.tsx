'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TelegramLoginWidgetProps {
  buttonText?: string;
}

export default function TelegramLoginWidget({
  buttonText = 'ចូលគណនីតាមរយៈ Telegram',
}: TelegramLoginWidgetProps) {
  const router = useRouter();
  const { telegramOidcAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BOT_ID = '8953849304';
  const DOMAIN = 'sakuraapi.lol';

  // Handle incoming Telegram OpenID authorization code
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      setLoading(true);
      setError(null);

      // Clean URL query parameters
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, cleanUrl);

      telegramOidcAuth(code, cleanUrl)
        .then((res) => {
          if (res.success) {
            router.push('/dashboard');
          } else {
            setError(res.error || 'ការផ្ទៀងផ្ទាត់គណនី Telegram បរាជ័យ សូមព្យាយាមម្តងទៀត');
          }
        })
        .catch((err) => {
          setError(err.message || 'មានបញ្ហាតភ្ជាប់ទៅកាន់ប្រព័ន្ធ');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [telegramOidcAuth, router]);

  const handleTelegramLogin = () => {
    setError(null);
    setLoading(true);

    if (typeof window !== 'undefined') {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const authUrl = `https://oauth.telegram.org/auth?client_id=${BOT_ID}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=openid%20profile`;

      window.location.href = authUrl;
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4">
      {error && (
        <div className="w-full p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="w-full p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center gap-2.5 text-xs text-sky-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          <span>កំពុងផ្ទៀងផ្ទាត់ និងដំណើរការចូលគណនីជាមួយ Telegram...</span>
        </div>
      )}

      {/* Modern Official Telegram OIDC Button */}
      <button
        type="button"
        onClick={handleTelegramLogin}
        disabled={loading}
        className="group relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#229ED9] via-[#0088cc] to-[#0077b3] hover:from-[#1da1f2] hover:to-[#0088cc] text-white font-bold text-sm sm:text-base transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 overflow-hidden"
      >
        {/* Glow Shimmer */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Send className="w-3.5 h-3.5 fill-white text-white translate-x-[-1px] translate-y-[-0.5px]" />
        </div>
        <span>{buttonText}</span>
      </button>

      <div className="space-y-1.5 pt-1 text-center">
        <p className="text-xs text-zinc-300 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ផ្ទៀងផ្ទាត់ដោយផ្ទាល់តាម Telegram OpenID Connect (OIDC)</span>
        </p>
        <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
          សុវត្ថិភាពខ្ពស់ មិនចាំបាច់បំពេញលេខសម្ងាត់ ចុចតែមួយ Click ចូលប្រើ Dashboard បានភ្លាម។
        </p>
      </div>
    </div>
  );
}
