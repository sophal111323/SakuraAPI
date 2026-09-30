'use client';

import React, { useState, useEffect } from 'react';
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
  Info
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

export default function CategoriesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
        setGames(json.data || json);
      } else {
        // Fallback default games for preview
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
            id: 'g-4',
            code: 'pubg-mobile',
            name: 'PUBG Mobile',
            category: 'Battle Royale',
            requiresServerId: false,
            playerIdLabel: 'Character ID (UID)',
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
        // Mock fallback products
        setProducts([
          { id: 'p-1', code: `${game.code}-tier-1`, name: 'Base Top-up Package', price: 1.45, currency: 'USD', status: 'AVAILABLE', providerPrice: 1.30 },
          { id: 'p-2', code: `${game.code}-tier-2`, name: 'Medium Top-up Package', price: 4.20, currency: 'USD', status: 'AVAILABLE', providerPrice: 3.80 },
          { id: 'p-3', code: `${game.code}-tier-3`, name: 'Premium Pack + Bonus', price: 11.00, currency: 'USD', status: 'AVAILABLE', providerPrice: 10.20 },
        ]);
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

  const filteredGames = games.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase()) ||
      (g.category && g.category.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Game Categories & Stock</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                {games.length} Games
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Automated real-time stock synchronization with instant fulfillment gateway. Click any game to view products and live reseller rates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search game or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#130f26] border border-[#2d2454] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <button
              onClick={fetchGames}
              disabled={loading}
              className="p-2 rounded-xl bg-[#16122d] hover:bg-[#201844] border border-[#2d2454] text-zinc-300 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notice Info Card */}
        <div className="bg-[#120e24] border border-purple-500/20 rounded-xl p-3.5 flex items-center gap-3 text-xs text-zinc-300 animate-slide-up-2">
          <Info className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            <strong>Pricing Engine:</strong> Prices displayed reflect your reseller cost after tier discount calculation. Product codes match official publisher denomination specs.
          </span>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up-3">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => openGameProducts(game)}
              className="bg-[#130f26] border border-[#2b2252] hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-purple-600/10 space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-300 group-hover:scale-105 transition shadow-inner">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {game.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition line-clamp-1">
                    {game.name}
                  </h3>
                  <div className="font-mono text-[11px] text-zinc-500">{game.code}</div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#1e1738] text-[11px] text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>Category:</span>
                    <span className="text-zinc-300 font-medium">{game.category || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Server Required:</span>
                    <span
                      className={`font-medium ${
                        game.requiresServerId ? 'text-amber-400' : 'text-zinc-400'
                      }`}
                    >
                      {game.requiresServerId ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Products:</span>
                    <span className="text-purple-300 font-semibold">{game.productCount} packages</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e1738] flex items-center justify-between text-xs text-purple-400 font-medium group-hover:translate-x-0.5 transition">
                <span>View Products</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Products Modal / Slide-over */}
        {selectedGame && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#120e24] border border-[#2b2252] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-5 border-b border-[#221c3b] flex items-center justify-between bg-[#15102a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-300">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedGame.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="font-mono text-purple-300">{selectedGame.code}</span>
                      <span>•</span>
                      <span>{selectedGame.playerIdLabel || 'Player ID'}</span>
                      {selectedGame.requiresServerId && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">{selectedGame.serverIdLabel || 'Server ID'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedGame(null)}
                  className="p-1.5 rounded-lg bg-[#1e1738] hover:bg-[#2d2254] text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Products Content */}
              <div className="p-5 overflow-y-auto space-y-4">
                {productsLoading ? (
                  <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                    <span>Loading live product stock and pricing...</span>
                  </div>
                ) : products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0b0914] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-[#221c3b]">
                        <tr>
                          <th className="py-3 px-3">Product Name</th>
                          <th className="py-3 px-3">Product Code</th>
                          <th className="py-3 px-3">Reseller Price</th>
                          <th className="py-3 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e1738]">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-[#181330] transition">
                            <td className="py-3 px-3 font-semibold text-white">{p.name}</td>
                            <td className="py-3 px-3 font-mono text-purple-300">{p.code}</td>
                            <td className="py-3 px-3 font-bold text-emerald-400 text-sm">
                              ${parseFloat(p.price.toString()).toFixed(2)}
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    No products currently available for this category.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#221c3b] bg-[#100d1e] flex items-center justify-between text-xs text-zinc-400">
                <span>Use these product codes in your API orders</span>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
