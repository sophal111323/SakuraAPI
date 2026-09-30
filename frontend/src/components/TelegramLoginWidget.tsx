'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle, Send, Globe, CheckCircle2 } from 'lucide-react';

interface TelegramLoginWidgetProps {
  buttonText?: string;
}

export default function TelegramLoginWidget({
  buttonText = 'ចូលគណនីតាមរយៈ Telegram',
}: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { telegramAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIpAddress, setIsIpAddress] = useState(false);

  const BOT_USERNAME = 'Sakuraapi_bot';
  const BOT_ID = '8953849304';
  const DOMAIN = 'sakuraapi.lol';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        setIsIpAddress(true);
      }
    }
  }, []);

  const handleAuthData = async (user: any) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await telegramAuth(user);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'ការភ្ជាប់ជាមួយ Telegram បរាជ័យ សូមព្យាយាមម្តងទៀត');
      }
    } catch (err: any) {
      setError(err.message || 'មានបញ្ហាតភ្ជាប់ទៅកាន់ Server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (window as any).onTelegramAuth = (user: any) => {
      handleAuthData(user);
    };

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-telegram-login', BOT_USERNAME);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '14');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-userpic', 'true');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      containerRef.current.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, []);

  const handleDirectTelegramPopup = () => {
    setError(null);
    const width = 550;
    const height = 470;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/login` : `https://${DOMAIN}/login`;
    const url = `https://oauth.telegram.org/auth?client_id=${BOT_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code`;
    window.open(url, 'telegram_oauth', `width=${width},height=${height},left=${left},top=${top}`);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4">
      {/* IP Address Warning with 1-click domain redirect */}
      {isIpAddress && (
        <div className="w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <Globe className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span className="leading-relaxed">
              ការភ្ជាប់ Telegram តម្រូវឱ្យប្រើប្រាស់ Domain ផ្លូវការ <strong>https://{DOMAIN}</strong>។
            </span>
          </div>
          <a
            href={`https://${DOMAIN}/login`}
            className="block text-center w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium transition"
          >
            ប្តូរទៅកាន់ https://{DOMAIN}/login
          </a>
        </div>
      )}

      {error && (
        <div className="w-full p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2.5 text-xs text-sky-400 py-2.5 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>កំពុងផ្ទៀងផ្ទាត់ និងចូលគណនីជាមួយ Telegram...</span>
        </div>
      )}

      {/* Official Telegram Widget Container (Prominently Highlighted) */}
      <div className="w-full flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-[#181135] to-[#120d28] border border-sky-500/30 shadow-xl shadow-sky-500/10 space-y-3">
        <div className="text-xs text-sky-300 font-semibold flex items-center justify-center gap-1.5">
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>ចុចប៊ូតុងផ្លូវការ Telegram ខាងក្រោមដើម្បី Login៖</span>
        </div>
        <div
          ref={containerRef}
          className="flex items-center justify-center min-h-[44px] overflow-hidden rounded-xl"
        />
      </div>

      <div className="space-y-1.5 pt-1 text-center">
        <p className="text-xs text-zinc-300 font-medium flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>សុវត្ថិភាព 100% ផ្ទៀងផ្ទាត់ដោយផ្ទាល់តាម Telegram</span>
        </p>
        <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
          ចុចលើប៊ូតុង Telegram ពណ៌ខៀវខាងលើ ដើម្បីចូលប្រើប្រាស់ Dashboard ដោយស្វ័យប្រវត្តិ។
        </p>
      </div>
    </div>
  );
}
