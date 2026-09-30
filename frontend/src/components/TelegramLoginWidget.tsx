'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle, Send, Globe, CheckCircle2 } from 'lucide-react';

interface TelegramLoginWidgetProps {
  buttonText?: string;
}

export default function TelegramLoginWidget({
  buttonText = 'ភ្ជាប់ជាមួយ Telegram ដើម្បីចុះឈ្មោះ',
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
    if (typeof window !== 'undefined' && (window as any).Telegram?.Login) {
      (window as any).Telegram.Login.auth(
        { bot_id: BOT_ID, request_access: 'write' },
        (user: any) => {
          if (user) {
            handleAuthData(user);
          }
        }
      );
    } else {
      const width = 550;
      const height = 470;
      const left = Math.max(0, (window.screen.width - width) / 2);
      const top = Math.max(0, (window.screen.height - height) / 2);
      const origin = window.location.origin;
      const url = `https://oauth.telegram.org/auth?bot_id=${BOT_ID}&origin=${encodeURIComponent(
        origin
      )}&request_access=write&return_to=${encodeURIComponent(window.location.href)}`;
      window.open(url, 'telegram_oauth', `width=${width},height=${height},left=${left},top=${top}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4">
      {/* IP Address Warning with 1-click domain redirect */}
      {isIpAddress && (
        <div className="w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <Globe className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span className="leading-relaxed">
              ការភ្ជាប់ Telegram តម្រូវឱ្យប្រើប្រាស់ Domain ផ្លូវការ <strong>{DOMAIN}</strong> ជាជាងលេខ IP។
            </span>
          </div>
          <a
            href={`http://${DOMAIN}/register`}
            className="block text-center w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium transition"
          >
            ប្តូរទៅកាន់ http://{DOMAIN}/register
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
          <span>កំពុងផ្ទៀងផ្ទាត់ និងបង្កើតគណនីជាមួយ Telegram...</span>
        </div>
      )}

      {/* Official Telegram Widget Container */}
      <div
        ref={containerRef}
        className="flex items-center justify-center min-h-[44px] overflow-hidden rounded-2xl"
      />

      {/* Fallback Direct Button */}
      <button
        type="button"
        onClick={handleDirectTelegramPopup}
        disabled={loading}
        className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#229ED9] via-[#0088cc] to-[#0077b3] hover:from-[#1e8bc0] hover:to-[#006699] text-white font-semibold text-sm transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-[0.98]"
      >
        <Send className="w-4 h-4 fill-white" />
        <span>{buttonText}</span>
      </button>

      <div className="space-y-1.5 pt-2 text-center">
        <p className="text-xs text-zinc-300 font-medium flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>ប្រព័ន្ធបង្កើតគណនីស្វ័យប្រវត្តិ 100% ភ្លាមៗ</span>
        </p>
        <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
          មិនចាំបាច់បំពេញលេខសម្ងាត់ឡើយ គណនី Telegram របស់អ្នកជាសោរសុវត្ថិភាពផ្ទាល់។
        </p>
      </div>
    </div>
  );
}
