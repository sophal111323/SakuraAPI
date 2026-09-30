'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  Search,
  ArrowLeft,
  Gem,
  Coins,
  Ticket,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  Layers,
  ArrowRight
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
  code: string; // id item
  name: string; // name package
  price: number; // amount
  currency: string;
  status: string;
  providerPrice: number;
}

const GAME_LOGOS: Record<string, string> = {
  'mobile-legends': '/games/mlbb.svg',
  'free-fire': '/games/freefire.svg',
  'pubg-mobile': '/games/pubg.svg',
  'genshin-impact': '/games/genshin.svg',
  'honor-of-kings': '/games/hok.svg',
  'roblox': '/games/roblox.svg',
};

export default function CategoriesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/games`);
      if (res.ok) {
        const json = await res.json();
        const apiGames: Game[] = json.data || json;

        // Ensure all top 6 games are displayed cleanly
        const allCatalog: Game[] = [
          ...apiGames,
          ...(!apiGames.some((g) => g.code === 'honor-of-kings')
            ? [
                {
                  id: 'g-hok',
                  code: 'honor-of-kings',
                  name: 'Honor of Kings',
                  category: 'MOBA',
                  requiresServerId: false,
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
            status: 'ACTIVE',
            productCount: 5,
          },
          {
            id: 'g-2',
            code: 'free-fire',
            name: 'Garena Free Fire',
            category: 'Battle Royale',
            requiresServerId: false,
            status: 'ACTIVE',
            productCount: 4,
          },
          {
            id: 'g-3',
            code: 'pubg-mobile',
            name: 'PUBG Mobile',
            category: 'Battle Royale',
            requiresServerId: false,
            status: 'ACTIVE',
            productCount: 3,
          },
          {
            id: 'g-4',
            code: 'genshin-impact',
            name: 'Genshin Impact',
            category: 'RPG',
            requiresServerId: true,
            status: 'ACTIVE',
            productCount: 4,
          },
          {
            id: 'g-5',
            code: 'honor-of-kings',
            name: 'Honor of Kings',
            category: 'MOBA',
            requiresServerId: false,
            status: 'ACTIVE',
            productCount: 4,
          },
          {
            id: 'g-6',
            code: 'roblox',
            name: 'Roblox & Digital Codes',
            category: 'Gift Cards',
            requiresServerId: false,
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
        // Fallback packages per game
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
        } else if (game.code === 'genshin-impact') {
          setProducts([
            { id: 'p-1', code: 'gi-60', name: '60 Genesis Crystals', price: 1.05, currency: 'USD', status: 'AVAILABLE', providerPrice: 0.95 },
            { id: 'p-2', code: 'gi-330', name: '300+30 Genesis Crystals', price: 5.00, currency: 'USD', status: 'AVAILABLE', providerPrice: 4.60 },
            { id: 'p-3', code: 'gi-welkin', name: 'Blessing of the Welkin Moon', price: 5.10, currency: 'USD', status: 'AVAILABLE', providerPrice: 4.70 },
          ]);
        } else if (game.code === 'honor-of-kings') {
          setProducts([
            { id: 'p-1', code: 'hok-80', name: '80+8 Tokens', price: 1.25, currency: 'USD', status: 'AVAILABLE', providerPrice: 1.10 },
            { id: 'p-2', code: 'hok-240', name: '240+25 Tokens', price: 3.75, currency: 'USD', status: 'AVAILABLE', providerPrice: 3.35 },
            { id: 'p-3', code: 'hok-card', name: 'Weekly Card Plus', price: 2.10, currency: 'USD', status: 'AVAILABLE', providerPrice: 1.90 },
          ]);
        } else {
          setProducts([
            { id: 'p-1', code: 'rbx-100', name: '100 Robux Digital Code', price: 1.30, currency: 'USD', status: 'AVAILABLE', providerPrice: 1.15 },
            { id: 'p-2', code: 'rbx-400', name: '400 Robux Digital Code', price: 4.90, currency: 'USD', status: 'AVAILABLE', providerPrice: 4.40 },
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

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render logo package icon based on name and game
  const renderPackageLogo = (productName: string, gameCode: string) => {
    const lowerName = productName.toLowerCase();

    if (lowerName.includes('pass') || lowerName.includes('welkin') || lowerName.includes('card')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
          <div className="w-full h-full bg-[#120a24] rounded-[14px] flex items-center justify-center">
            <Ticket className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      );
    }

    if (gameCode === 'pubg-mobile' || lowerName.includes('uc')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 p-0.5 shadow-md shadow-yellow-500/20 shrink-0">
          <div className="w-full h-full bg-[#140f07] rounded-[14px] flex items-center justify-center">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      );
    }

    if (gameCode === 'genshin-impact' || lowerName.includes('crystal')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-pink-400 to-purple-500 p-0.5 shadow-md shadow-cyan-500/20 shrink-0">
          <div className="w-full h-full bg-[#0d0922] rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-300" />
          </div>
        </div>
      );
    }

    // Default Diamond Logo
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-pink-500 to-purple-600 p-0.5 shadow-md shadow-pink-500/20 shrink-0">
        <div className="w-full h-full bg-[#0f0922] rounded-[14px] flex items-center justify-center">
          <Gem className="w-5 h-5 text-sky-300" />
        </div>
      </div>
    );
  };

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080510] text-[#f1f0f7] selection:bg-pink-500 selection:text-white relative">
      <Navigation />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-purple-900/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* VIEW 1: GAME PRODUCTS ITEMS VIEW (WHEN A GAME IS CLICKED) */}
        {selectedGame ? (
          <div className="space-y-6 animate-slide-up-1">
            {/* Top Navigation & Selected Game Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#120d26]/80 backdrop-blur-xl border border-[#2b2052] rounded-3xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedGame(null)}
                  className="p-2.5 rounded-2xl bg-[#191136] hover:bg-[#25194d] border border-[#2e2158] text-zinc-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-pink-400" />
                  <span>ត្រឡប់ក្រោយ (Back)</span>
                </button>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-sky-400 shadow-xl shrink-0">
                  <div className="w-full h-full bg-[#0d091e] rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
                    <img
                      src={GAME_LOGOS[selectedGame.code] || '/games/mlbb.svg'}
                      alt={selectedGame.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div>
                  <h1 className="text-lg sm:text-2xl font-extrabold text-white">
                    {selectedGame.name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono text-purple-300">{selectedGame.code}</span>
                    <span>•</span>
                    <span>{products.length} កញ្ចប់តម្លៃ (Items)</span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-pink-600/25 transition flex items-center gap-1.5"
              >
                <span>កុម្ម៉ង់ក្នុង Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Products Items List (Shows: Logo Package, Name Package, ID Item, Amount) */}
            {productsLoading ? (
              <div className="py-20 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-pink-400" />
                <span>កំពុងទាញយកបញ្ជីទំនិញ (Loading Product Items)...</span>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#120d26]/85 backdrop-blur-xl border border-[#2b2052] hover:border-pink-500/50 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 group"
                  >
                    {/* 1. Logo Package & 2. Name Package & 3. ID Item */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Logo Package */}
                      {renderPackageLogo(item.name, selectedGame.code)}

                      {/* Name Package & ID Item */}
                      <div className="min-w-0">
                        {/* Name Package */}
                        <h4 className="font-bold text-sm text-white group-hover:text-pink-300 transition truncate">
                          {item.name}
                        </h4>

                        {/* ID Item */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">ID:</span>
                          <button
                            onClick={() => handleCopy(item.code)}
                            className="font-mono text-xs text-purple-300 hover:text-white bg-[#191136] px-1.5 py-0.5 rounded border border-[#2b2052] flex items-center gap-1 transition"
                            title="ចុចដើម្បីចម្លង (Copy ID)"
                          >
                            <span>{item.code}</span>
                            {copiedId === item.code ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-zinc-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 4. Amount */}
                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold text-emerald-400 tracking-tight">
                        ${parseFloat(item.price.toString()).toFixed(2)}
                      </div>
                      <span className="text-[9px] uppercase font-bold text-zinc-500">
                        {item.currency || 'USD'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#120d26]/80 border border-[#2b2052] rounded-3xl text-zinc-400 text-xs">
                មិនមានទំនិញសម្រាប់ហ្គេមនេះនៅឡើយទេ។
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: CLEAN ORDERLY GAME LOGO & GAME NAME GRID */
          <div className="space-y-6 animate-slide-up-1">
            {/* Header & Clean Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>បញ្ជីហ្គេម (Games)</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 font-bold">
                    {games.length} Games
                  </span>
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  ចុចលើហ្គេមណាមួយ ដើម្បីពិនិត្យមើលកញ្ចប់ទំនិញ (Product Items)
                </p>
              </div>

              {/* Compact Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះហ្គេម..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#120d26] border border-[#2b2052] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition shadow-inner"
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
            </div>

            {/* Clean, Orderly Game Grid (Only Game Logo & Game Name) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {filteredGames.map((game) => {
                const logo = GAME_LOGOS[game.code] || '/games/mlbb.svg';

                return (
                  <div
                    key={game.id}
                    onClick={() => openGameProducts(game)}
                    className="bg-[#120d26]/80 hover:bg-[#181136] border border-[#261f43] hover:border-pink-500/60 rounded-3xl p-4 sm:p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-600/10 group select-none"
                  >
                    {/* Game Logo */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-pink-500/30 via-purple-500/20 to-sky-400/30 group-hover:from-pink-500/60 group-hover:to-sky-400/60 transition-all duration-300 shadow-lg mb-3">
                      <div className="w-full h-full rounded-[14px] bg-[#0c081d] flex items-center justify-center p-1.5 overflow-hidden">
                        <img
                          src={logo}
                          alt={game.name}
                          className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>

                    {/* Game Name */}
                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-pink-300 transition-colors line-clamp-2 leading-snug">
                      {game.name}
                    </h3>
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
                <h3 className="text-base font-bold text-white">រកមិនឃើញហ្គេមនេះទេ</h3>
                <p className="text-xs text-zinc-400">
                  សូមសាកល្បងវាយឈ្មោះហ្គេមផ្សេងទៀត។
                </p>
                <button
                  onClick={() => setSearch('')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
                >
                  បង្ហាញហ្គេមទាំងអស់
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
