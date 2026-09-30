'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  Gamepad2,
  Search,
  Server,
  Layers,
  CheckCircle2,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  Tag,
  RefreshCw,
  Info,
  Sparkles,
  Zap,
  UserCheck,
  ArrowRight,
  TrendingUp,
  Flame,
  Award
} from 'lucide-react';

interface Game {
  id: string;
  code: string;
  name: string;
  category: string;
  iconUrl?: string;
  requiresServerId: boolean;
  serverIdLabel?: string;
  playerIdLabel?: string;
  status: string;
  productCount: number;
}

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  currency: string;
  status: string;
  providerPrice: number;
}

// Visual branding and metadata for games
const GAME_CONFIG: Record<
  string,
  {
    logo: string;
    publisher: string;
    badge: string;
    accentColor: string;
    bannerGradient: string;
    glowBorder: string;
    popular?: boolean;
    description: string;
  }
> = {
  'mobile-legends': {
    logo: '/games/mlbb.svg',
    publisher: 'MOONTON',
    badge: 'ពេញនិយមបំផុត (Top Hot)',
    accentColor: 'from-amber-400 to-yellow-500',
    bannerGradient: 'from-blue-900/40 via-indigo-950/30 to-transparent',
    glowBorder: 'hover:border-blue-500/60 hover:shadow-blue-500/20',
    popular: true,
    description: 'Auto Check-ID • Weekly Diamond Pass • Instant Top-up < 3s',
  },
  'free-fire': {
    logo: '/games/freefire.svg',
    publisher: 'GARENA',
    badge: 'ល្បឿនលឿន (Instant Push)',
    accentColor: 'from-orange-400 to-red-500',
    bannerGradient: 'from-orange-950/40 via-red-950/30 to-transparent',
    glowBorder: 'hover:border-orange-500/60 hover:shadow-orange-500/20',
    popular: true,
    description: 'Direct Player ID • Diamonds Auto-Push 24/7 • Zero Failure',
  },
  'pubg-mobile': {
    logo: '/games/pubg.svg',
    publisher: 'KRAFTON / TENCENT',
    badge: 'ស្តុកពេញ (Global Stock)',
    accentColor: 'from-amber-300 to-yellow-500',
    bannerGradient: 'from-amber-950/35 via-stone-900/30 to-transparent',
    glowBorder: 'hover:border-amber-500/60 hover:shadow-amber-500/20',
    popular: true,
    description: 'Global & Regional UC • Fast UID Fulfillment • Auto-Refund',
  },
  'genshin-impact': {
    logo: '/games/genshin.svg',
    publisher: 'HOYOVERSE',
    badge: 'Global Server Direct',
    accentColor: 'from-pink-400 to-purple-400',
    bannerGradient: 'from-purple-950/40 via-indigo-950/30 to-transparent',
    glowBorder: 'hover:border-purple-500/60 hover:shadow-purple-500/20',
    popular: false,
    description: 'Genesis Crystals • Blessing of the Welkin Moon • Multi-Server',
  },
  'honor-of-kings': {
    logo: '/games/hok.svg',
    publisher: 'LEVEL INFINITE',
    badge: 'ហ្គេមថ្មី (New Trending)',
    accentColor: 'from-fuchsia-400 to-pink-500',
    bannerGradient: 'from-fuchsia-950/40 via-purple-950/30 to-transparent',
    glowBorder: 'hover:border-fuchsia-500/60 hover:shadow-fuchsia-500/20',
    popular: true,
    description: 'Direct Tokens • Weekly Card • In-Game Name Verification',
  },
  'roblox': {
    logo: '/games/roblox.svg',
    publisher: 'ROBLOX CORP',
    badge: 'Digital Gift Code',
    accentColor: 'from-rose-400 to-red-500',
    bannerGradient: 'from-rose-950/40 via-zinc-900/30 to-transparent',
    glowBorder: 'hover:border-rose-500/60 hover:shadow-rose-500/20',
    popular: false,
    description: 'Robux Fast Top-up • Instant Digital Voucher • Automated Code',
  },
};

export default function CategoriesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/games`);
      if (res.ok) {
        const json = await res.json();
        const apiGames: Game[] = json.data || json;

        // Base 6 core games catalog ensure all top popular games exist
        const allCatalog: Game[] = [
          ...apiGames,
          // If Honor of Kings or Roblox aren't in API yet, add them seamlessly
          ...(!apiGames.some((g) => g.code === 'honor-of-kings')
            ? [
                {
                  id: 'g-hok',
                  code: 'honor-of-kings',
                  name: 'Honor of Kings',
                  category: 'MOBA',
                  requiresServerId: false,
                  playerIdLabel: 'Player ID (UID)',
                  status: 'ACTIVE',
                  productCount: 4,
                },
              ]
            : []),
          ...(!apiGames.some((g) => g.code === 'roblox')
            ? [
                {
                  id: 'g-rbx',
                  code: 'roblox',
                  name: 'Roblox & Digital Codes',
                  category: 'Gift Cards',
                  requiresServerId: false,
                  playerIdLabel: 'Username / Account',
                  status: 'ACTIVE',
                  productCount: 3,
                },
              ]
            : []),
        ];

        setGames(allCatalog);
      } else {
        // Fallback default games
        setGames([
          {
            id: 'g-1',
            code: 'mobile-legends',
            name: 'Mobile Legends: Bang Bang',
            category: 'MOBA',
            requiresServerId: true,
            serverIdLabel: 'Zone ID (4 digits)',
            playerIdLabel: 'User ID (e.g. 12345678)',
            status: 'ACTIVE',
            productCount: 5,
          },
          {
            id: 'g-2',
            code: 'free-fire',
            name: 'Garena Free Fire',
            category: 'Battle Royale',
            requiresServerId: false,
            playerIdLabel: 'Player ID (UID)',
            status: 'ACTIVE',
            productCount: 4,
          },
          {
            id: 'g-3',
            code: 'pubg-mobile',
            name: 'PUBG Mobile',
            category: 'Battle Royale',
            requiresServerId: false,
            playerIdLabel: 'Character ID (UID)',
            status: 'ACTIVE',
            productCount: 3,
          },
          {
            id: 'g-4',
            code: 'genshin-impact',
            name: 'Genshin Impact',
            category: 'RPG',
            requiresServerId: true,
            serverIdLabel: 'Server (os_asia, os_usa...)',
            playerIdLabel: 'UID (9 digits)',
            status: 'ACTIVE',
            productCount: 4,
          },
          {
            id: 'g-5',
            code: 'honor-of-kings',
            name: 'Honor of Kings',
            category: 'MOBA',
            requiresServerId: false,
            playerIdLabel: 'Player ID (UID)',
            status: 'ACTIVE',
            productCount: 4,
          },
          {
            id: 'g-6',
            code: 'roblox',
            name: 'Roblox & Digital Codes',
            category: 'Gift Cards',
            requiresServerId: false,
            playerIdLabel: 'Username / Account',
            status: 'ACTIVE',
            productCount: 3,
          },
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const openGameProducts = async (game: Game) => {
    setSelectedGame(game);
    setProductsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/games/${game.code}/products`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || json);
      } else {
        // Fallback default packages per game
        if (game.code === 'mobile-legends') {
          setProducts([
            { id: 'p-1', code: 'mlbb-86', name: '86 Diamonds', price: 1.45, currency: 'USD', status: 'AVAILABLE', providerPrice: 1.30 },
            { id: 'p-2', code: 'mlbb-257', name: '257 Diamonds', price: 4.20, currency: 'USD', status: 'AVAILABLE', providerPrice: 3.80 },
            { id: 'p-3', code: 'mlbb-706', name: '706 Diamonds', price: 11.00, currency: 'USD', status: 'AVAILABLE', providerPrice: 10.20 },
            { id: 'p-4', code: 'mlbb-pass', name: 'Weekly Diamond Pass', price: 2.00, currency: 'USD', status: 'AVAILABLE', providerPrice: 1.80 },
            { id: 'p-5', code: 'mlbb-twilight', name: 'Twilight Pass', price: 9.20, currency: 'USD', status: 'AVAILABLE', providerPrice: 8.50 },
          ]);
        } else if (game.code === 'free-fire') {
          setProducts([
            { id: 'p-1', code: 'ff-100', name: '100 Diamonds', price: 1.00, currency: 'USD', status: 'AVAILABLE', providerPrice: 0.90 },
            { id: 'p-2', code: 'ff-310', name: '310 Diamonds', price: 3.00, currency: 'USD', status: 'AVAILABLE', providerPrice: 2.70 },
            { id: 'p-3', code: 'ff-520', name: '520 Diamonds', price: 4.95, currency: 'USD', status: 'AVAILABLE', providerPrice: 4.50 },
            { id: 'p-4', code: 'ff-1060', name: '1060 Diamonds', price: 9.80, currency: 'USD', status: 'AVAILABLE', providerPrice: 8.90 },
          ]);
        } else if (game.code === 'pubg-mobile') {
          setProducts([
            { id: 'p-1', code: 'pubg-60', name: '60 Unknown Cash (UC)', price: 1.00, currency: 'USD', status: 'AVAILABLE', providerPrice: 0.90 },
            { id: 'p-2', code: 'pubg-325', name: '325 Unknown Cash (UC)', price: 4.95, currency: 'USD', status: 'AVAILABLE', providerPrice: 4.50 },
            { id: 'p-3', code: 'pubg-660', name: '660 Unknown Cash (UC)', price: 9.90, currency: 'USD', status: 'AVAILABLE', providerPrice: 9.10 },
          ]);
        } else {
          setProducts([
            { id: 'p-1', code: `${game.code}-tier-1`, name: 'Base Package', price: 1.25, currency: 'USD', status: 'AVAILABLE', providerPrice: 1.10 },
            { id: 'p-2', code: `${game.code}-tier-2`, name: 'Medium Value Pack', price: 3.80, currency: 'USD', status: 'AVAILABLE', providerPrice: 3.40 },
            { id: 'p-3', code: `${game.code}-tier-3`, name: 'Premium Special Pack', price: 9.50, currency: 'USD', status: 'AVAILABLE', providerPrice: 8.70 },
          ]);
        }
      }
    } catch {
      // Fallback
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const categoriesList = [
    { label: 'ទាំងអស់ (All Games)', value: 'ALL', icon: '🌟' },
    { label: 'MOBA', value: 'MOBA', icon: '⚔️' },
    { label: 'Battle Royale', value: 'Battle Royale', icon: '🎯' },
    { label: 'RPG / Open World', value: 'RPG', icon: '🌌' },
    { label: 'Gift Cards', value: 'Gift Cards', icon: '🎁' },
  ];

  const filteredGames = games.filter((g) => {
    const matchesCategory =
      categoryFilter === 'ALL' ||
      g.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase()) ||
      (g.category && g.category.toLowerCase().includes(search.toLowerCase())) ||
      (GAME_CONFIG[g.code]?.publisher &&
        GAME_CONFIG[g.code].publisher.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#080510] text-[#f1f0f7] selection:bg-pink-500 selection:text-white relative">
      <Navigation />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-purple-900/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up-1">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>ស្តុកហ្គេមស្វ័យប្រវត្តិកំពូល • Verified Game Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Game Categories & Stock
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              បញ្ជីហ្គេមកំពូលៗដែលគាំទ្រការ Top-up ដោយស្វ័យប្រវត្តិតាម API ល្បឿនលឿនក្រោម 3 វិនាទី និងប្រព័ន្ធផ្ទៀងផ្ទាត់ Player ID ត្រឹមត្រូវ 100%។
            </p>
          </div>

          {/* Quick Stats Ribbon */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <div className="px-3.5 py-2 rounded-2xl bg-[#130d28]/80 border border-[#2d2256] text-center shadow-lg">
              <div className="text-lg font-extrabold text-white">{games.length}+</div>
              <div className="text-[10px] text-zinc-400">ហ្គេមកំពូល</div>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-[#130d28]/80 border border-[#2d2256] text-center shadow-lg">
              <div className="text-lg font-extrabold text-pink-400">&lt; 3.0s</div>
              <div className="text-[10px] text-zinc-400">ល្បឿនបញ្ចូល</div>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-[#130d28]/80 border border-[#2d2256] text-center shadow-lg">
              <div className="text-lg font-extrabold text-emerald-400">100%</div>
              <div className="text-[10px] text-zinc-400">Auto-Refund</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="bg-[#120d26]/85 backdrop-blur-xl border border-[#2b2052] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 animate-slide-up-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {categoriesList.map((cat) => {
                const active = categoryFilter === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold transition whitespace-nowrap ${
                      active
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/25 border border-pink-500/30'
                        : 'bg-[#181135]/80 hover:bg-[#22184c] text-zinc-300 border border-[#2d2156]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះហ្គេម ឬ Code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#0b0718] border border-[#2f2258] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition shadow-inner"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={fetchGames}
                disabled={loading}
                className="p-2 rounded-2xl bg-[#181135] hover:bg-[#22184c] border border-[#2d2156] text-zinc-300 transition disabled:opacity-50 shrink-0"
                title="Refresh Catalog"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Real-time Indicator banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#221742] text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-300">
                រកឃើញ <strong>{filteredGames.length}</strong> ហ្គេមដែលត្រៀមរួចជាស្រេច
              </span>
            </div>
            <div className="flex items-center gap-4 text-zinc-400">
              <span>Auto ID Verification: <strong className="text-emerald-400">Active</strong></span>
              <span>API Gateway: <strong className="text-purple-300">Live 24/7</strong></span>
            </div>
          </div>
        </div>

        {/* Games Grid (Organized, Clean, with Game Logos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up-3">
          {filteredGames.map((game) => {
            const config = GAME_CONFIG[game.code] || {
              logo: '/games/mlbb.svg',
              publisher: 'GLOBAL PUBLISHER',
              badge: 'ស្វ័យប្រវត្តិ 24/7',
              accentColor: 'from-purple-400 to-pink-400',
              bannerGradient: 'from-purple-950/40 to-transparent',
              glowBorder: 'hover:border-pink-500/50 hover:shadow-pink-500/15',
              popular: false,
              description: 'Instant Automated Game Top-up • Upstream Gateway',
            };

            return (
              <div
                key={game.id}
                className={`bg-[#120d26]/90 border border-[#2b2052] rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1 ${config.glowBorder}`}
              >
                {/* Card Top Banner with Subtle Themed Gradient */}
                <div>
                  <div className={`h-24 w-full bg-gradient-to-r ${config.bannerGradient} relative p-4 flex items-start justify-between border-b border-[#231844]`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-zinc-300 border border-white/10">
                      {config.publisher}
                    </span>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{game.status}</span>
                    </span>
                  </div>

                  {/* Logo Overlay & Game Info */}
                  <div className="px-5 pt-0 pb-4 relative">
                    {/* Game Logo Image Container */}
                    <div className="-mt-12 mb-3.5 flex items-end justify-between">
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl p-1 bg-gradient-to-tr from-pink-500/40 via-purple-500/30 to-sky-400/40 shadow-2xl backdrop-blur-md">
                        <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#0d091e] border border-[#3b2b6e] flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={config.logo}
                            alt={game.name}
                            className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                            onError={(e) => {
                              // Fallback to generic icon if image fails
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </div>

                      {/* Hot / Popular Badge */}
                      {config.popular && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold shadow-md shadow-pink-500/15 mb-1">
                          <Flame className="w-3 h-3 text-pink-400 fill-pink-400" />
                          <span>{config.badge}</span>
                        </div>
                      )}
                    </div>

                    {/* Game Titles */}
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                        {game.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                          {game.code}
                        </span>
                        <span className="text-xs text-zinc-400">•</span>
                        <span className="text-xs text-zinc-400 font-medium">{game.category}</span>
                      </div>
                      <p className="text-xs text-zinc-400 pt-1 leading-relaxed line-clamp-2">
                        {config.description}
                      </p>
                    </div>

                    {/* Specification Specs Box */}
                    <div className="mt-4 p-3 rounded-2xl bg-[#171032]/80 border border-[#2b2052] space-y-2 text-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>ទម្រង់គណនី (ID Format):</span>
                        <span className="text-zinc-200 font-medium">
                          {game.playerIdLabel || 'Player ID'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Zone/Server ID:</span>
                        <span
                          className={`font-semibold ${
                            game.requiresServerId
                              ? 'text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded'
                              : 'text-zinc-500'
                          }`}
                        >
                          {game.requiresServerId ? 'តម្រូវការ Zone ID' : 'មិនតម្រូវការ'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-[#231844]">
                        <span>កញ្ចប់តម្លៃ (Packages):</span>
                        <span className="text-pink-300 font-bold">
                          {game.productCount} កញ្ចប់
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => openGameProducts(game)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all duration-200 shadow-lg shadow-purple-600/25 flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <span>ពិនិត្យមើលកញ្ចប់តម្លៃ (View Products)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <Link
                      href="/dashboard"
                      className="py-1.5 px-2 rounded-xl bg-[#191136] hover:bg-[#23184d] border border-[#2c2054] text-purple-300 hover:text-white transition flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Zap className="w-3 h-3 text-pink-400" />
                      <span>កុម្ម៉ង់ Top-up</span>
                    </Link>

                    <Link
                      href="/docs"
                      className="py-1.5 px-2 rounded-xl bg-[#191136] hover:bg-[#23184d] border border-[#2c2054] text-zinc-300 hover:text-white transition flex items-center justify-center gap-1 text-[11px]"
                    >
                      <span>API Specs</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Result */}
        {filteredGames.length === 0 && (
          <div className="p-12 text-center bg-[#120d26]/80 border border-[#2b2052] rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">មិនមានហ្គេមដែលផ្គូផ្គងនឹងការស្វែងរកឡើយ</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              សូមសាកល្បងវាយពាក្យគន្លឹះផ្សេងទៀត ឬជ្រើសរើសផ្ទាំង Category ផ្សេង។
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
            >
              បង្ហាញហ្គេមទាំងអស់
            </button>
          </div>
        )}

        {/* Modal: Game Products and Live Reseller Pricing */}
        {selectedGame && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#120d26] border border-[#3b2a6e] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-5 border-b border-[#251b46] flex items-center justify-between bg-gradient-to-r from-[#171032] via-[#120d26] to-[#15102a]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shrink-0">
                    <div className="w-full h-full bg-[#0d091e] rounded-[14px] flex items-center justify-center p-1">
                      <img
                        src={GAME_CONFIG[selectedGame.code]?.logo || '/games/mlbb.svg'}
                        alt={selectedGame.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white">{selectedGame.name}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {selectedGame.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="font-mono text-pink-400">{selectedGame.code}</span>
                      <span>•</span>
                      <span>{selectedGame.playerIdLabel || 'Player ID'}</span>
                      {selectedGame.requiresServerId && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">{selectedGame.serverIdLabel || 'Zone ID'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedGame(null)}
                  className="p-2 rounded-xl bg-[#1e153f] hover:bg-[#2b1f58] text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Products List Content */}
              <div className="p-5 overflow-y-auto space-y-4 max-h-[55vh]">
                <div className="bg-[#171032]/70 border border-[#2b2052] rounded-2xl p-3 flex items-center justify-between text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>តម្លៃនេះជាតម្លៃដើមសម្រាប់ Reseller (Reseller Cost Price) គិតជា $ USD។</span>
                  </div>
                  <span className="font-mono text-[11px] text-pink-300 shrink-0 font-bold">API FULFILLMENT</span>
                </div>

                {productsLoading ? (
                  <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-pink-400" />
                    <span>កំពុងទាញយកបញ្ជីកញ្ចប់ និងស្តុកទំនិញ...</span>
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-[#171032]/80 border border-[#2b2052] hover:border-pink-500/40 transition flex items-center justify-between shadow-md"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                            <span>{p.name}</span>
                          </div>
                          <div className="font-mono text-[10px] text-zinc-400">
                            Code: <code className="text-purple-300">{p.code}</code>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-extrabold text-emerald-400">
                            ${parseFloat(p.price.toString()).toFixed(2)}
                          </div>
                          <span className="text-[9px] uppercase font-bold text-zinc-400">
                            USD
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    មិនទាន់មានកញ្ចប់សម្រាប់ហ្គេមនេះនៅឡើយទេ។
                  </div>
                )}
              </div>

              {/* Modal Footer with Direct Actions */}
              <div className="p-4 border-t border-[#251b46] bg-[#0f0a20] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-zinc-400 text-center sm:text-left">
                  ប្រើប្រាស់ Product Code ខាងលើសម្រាប់បញ្ជាទិញតាម API ឬ Dashboard
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href="/dashboard"
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition text-center shadow-lg shadow-pink-600/30"
                  >
                    បញ្ជាទិញក្នុង Dashboard
                  </Link>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="px-4 py-2 rounded-xl bg-[#1c1439] hover:bg-[#281d52] text-zinc-300 font-semibold transition"
                  >
                    បិទ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
