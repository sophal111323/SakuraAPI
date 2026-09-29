'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

interface TelegramLoginWidgetProps {
  buttonText?: string;
}

export default function TelegramLoginWidget({
  buttonText = 'Connect with Telegram',
}: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { telegramAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'Sakuraapi_bot';

  useEffect(() => {
    // Set up global callback for Telegram Widget
    (window as any).onTelegramAuth = async (user: any) => {
      setLoading(true);
      setError(null);
      try {
        const res = await telegramAuth(user);
        if (res.success) {
          router.push('/');
        } else {
          setError(res.error || 'Failed to authenticate with Telegram');
        }
      } catch (err: any) {
        setError(err.message || 'Error communicating with server');
      } finally {
        setLoading(false);
      }
    };

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-userpic', 'true');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.async = true;
      containerRef.current.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [telegramAuth, router, botUsername]);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-3">
      {error && (
        <div className="w-full p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-sky-400 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Authenticating Telegram account...</span>
        </div>
      )}

      {/* Official Telegram Widget Container */}
      <div 
        ref={containerRef} 
        className="flex items-center justify-center min-h-[44px] overflow-hidden rounded-xl"
      />

      <p className="text-[11px] text-zinc-400 text-center">
        Instant registration & 1-click login linked directly to your Telegram profile.
      </p>
    </div>
  );
}
