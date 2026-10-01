'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  Gamepad2,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Layers,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  DollarSign,
  Server,
  User,
  ShieldAlert,
  Loader2,
  Eye,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';

interface ProductItem {
  id: string;
  gameId: string;
  code: string;
  name: string;
  providerPrice: string;
  resellerPrice: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISABLED';
  providerProductId?: string | null;
  createdAt: string;
}

interface GameItem {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  iconUrl?: string | null;
  requiresServerId: boolean;
  serverIdLabel?: string | null;
  playerIdLabel?: string | null;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  products?: ProductItem[];
  _count?: {
    products: number;
    orders: number;
  };
}

export default function AdminGamesPage() {
  const { token } = useAuth();
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'>('ALL');

  // Add / Edit Game Modal State
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [gameFormData, setGameFormData] = useState({
    code: '',
    name: '',
    category: '',
    iconUrl: '',
    requiresServerId: false,
    serverIdLabel: 'Server ID / Zone ID',
    playerIdLabel: 'Player ID / UID',
    status: 'ACTIVE' as 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage Products Modal State
  const [productModalGame, setProductModalGame] = useState<GameItem | null>(null);
  const [productFormData, setProductFormData] = useState({
    code: '',
    name: '',
    resellerPrice: '',
    providerPrice: '',
    providerProductId: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISABLED',
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Notification / Alert
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savingGame, setSavingGame] = useState(false);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'https://sakuraapi.lol/api/v1';
  const getAuthToken = () => token || (typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/games`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const items = json.data || json;
        setGames(Array.isArray(items) ? items : []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Handle Logo File Selection & Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showFeedback('error', 'ទំហំរូបភាពមិនត្រូវលើសពី 5MB ឡើយ');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setLogoPreview(base64Data);

      // Upload to VPS
      setUploadingLogo(true);
      try {
        const authToken = getAuthToken();
        const code = gameFormData.code || 'game-logo';
        const res = await fetch(`${getApiUrl()}/admin/games/upload-logo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            data: base64Data,
            gameCode: code,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const uploadedUrl = json.data?.url || json.url;
          setGameFormData((prev) => ({ ...prev, iconUrl: uploadedUrl }));
          showFeedback('success', 'រូប Logo ត្រូវបានបញ្ចូលទៅកាន់ Server បានជោគជ័យ!');
        } else {
          showFeedback('error', 'ការ Upload Logo ទទួលបរាជ័យ');
        }
      } catch {
        showFeedback('error', 'មានបញ្ហាក្នុងការ Upload Logo ទៅកាន់ Server');
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const openCreateModal = () => {
    setEditingGame(null);
    setGameFormData({
      code: '',
      name: '',
      category: 'Mobile Games',
      iconUrl: '',
      requiresServerId: false,
      serverIdLabel: 'Server ID / Zone ID',
      playerIdLabel: 'Player ID / UID',
      status: 'ACTIVE',
    });
    setLogoPreview(null);
    setGameModalOpen(true);
  };

  const openEditModal = (game: GameItem) => {
    setEditingGame(game);
    setGameFormData({
      code: game.code,
      name: game.name,
      category: game.category || 'Mobile Games',
      iconUrl: game.iconUrl || '',
      requiresServerId: game.requiresServerId,
      serverIdLabel: game.serverIdLabel || 'Server ID / Zone ID',
      playerIdLabel: game.playerIdLabel || 'Player ID / UID',
      status: game.status,
    });
    setLogoPreview(game.iconUrl || null);
    setGameModalOpen(true);
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameFormData.name.trim() || !gameFormData.code.trim()) {
      showFeedback('error', 'សូមបញ្ចូលឈ្មោះហ្គេម និងលេខកូដសម្គាល់ (Code/Slug)');
      return;
    }

    setSavingGame(true);
    try {
      const authToken = getAuthToken();
      const isEdit = !!editingGame;
      const url = isEdit
        ? `${getApiUrl()}/admin/games/${editingGame.id}`
        : `${getApiUrl()}/admin/games`;
      const method = isEdit ? 'PATCH' : 'POST';

      const payload: any = {
        name: gameFormData.name.trim(),
        category: gameFormData.category.trim() || undefined,
        iconUrl: gameFormData.iconUrl.trim() || undefined,
        requiresServerId: gameFormData.requiresServerId,
        serverIdLabel: gameFormData.serverIdLabel.trim() || undefined,
        playerIdLabel: gameFormData.playerIdLabel.trim() || undefined,
        status: gameFormData.status,
      };

      if (!isEdit) {
        payload.code = gameFormData.code.trim().toLowerCase().replace(/\s+/g, '-');
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error?.message || 'បរាជ័យក្នុងការរក្សាទុកហ្គេម');
      }

      showFeedback('success', isEdit ? 'កែប្រែព័ត៌មានហ្គេមបានជោគជ័យ' : 'បានបន្ថែមហ្គេមថ្មីជោគជ័យ');
      setGameModalOpen(false);
      fetchGames();
    } catch (err: any) {
      showFeedback('error', err.message || 'មានបញ្ហាក្នុងការរក្សាទុកហ្គេម');
    } finally {
      setSavingGame(false);
    }
  };

  const handleDeleteGame = async (game: GameItem) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបហ្គេម "${game.name}" មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`)) {
      return;
    }

    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/games/${game.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        showFeedback('success', `បានលុបហ្គេម "${game.name}" រួចរាល់`);
        fetchGames();
      } else {
        const json = await res.json();
        showFeedback('error', json.message || 'បរាជ័យក្នុងការលុបហ្គេម');
      }
    } catch {
      showFeedback('error', 'មានបញ្ហាក្នុងការលុបហ្គេម');
    }
  };

  const handleToggleGameStatus = async (game: GameItem) => {
    const nextStatus = game.status === 'ACTIVE' ? 'MAINTENANCE' : game.status === 'MAINTENANCE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/games/${game.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        showFeedback('success', `បានប្តូរស្ថានភាពទៅជា ${nextStatus}`);
        fetchGames();
      }
    } catch {
      showFeedback('error', 'បរាជ័យក្នុងការប្តូរស្ថានភាព');
    }
  };

  // Product Management
  const openProductModal = (game: GameItem) => {
    setProductModalGame(game);
    setProductFormData({
      code: '',
      name: '',
      resellerPrice: '',
      providerPrice: '',
      providerProductId: '',
      status: 'AVAILABLE',
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productModalGame) return;

    if (!productFormData.code.trim() || !productFormData.name.trim() || !productFormData.resellerPrice) {
      showFeedback('error', 'សូមបញ្ចូល Code, ឈ្មោះកញ្ចប់ និងតម្លៃលក់ (Reseller Price)');
      return;
    }

    setSubmittingProduct(true);
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/games/${productModalGame.id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          code: productFormData.code.trim(),
          name: productFormData.name.trim(),
          resellerPrice: parseFloat(productFormData.resellerPrice),
          providerPrice: productFormData.providerPrice ? parseFloat(productFormData.providerPrice) : 0,
          providerProductId: productFormData.providerProductId.trim() || undefined,
          status: productFormData.status,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'បរាជ័យក្នុងការបន្ថែមទំនិញ');
      }

      showFeedback('success', 'បានបន្ថែមទំនិញថ្មីជោគជ័យ');
      // Reset form
      setProductFormData({
        code: '',
        name: '',
        resellerPrice: '',
        providerPrice: '',
        providerProductId: '',
        status: 'AVAILABLE',
      });
      // Refresh current game data
      const updatedGamesRes = await fetch(`${getApiUrl()}/admin/games`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (updatedGamesRes.ok) {
        const items = await updatedGamesRes.json();
        const all = items.data || items;
        setGames(all);
        const currentUpdated = all.find((g: GameItem) => g.id === productModalGame.id);
        if (currentUpdated) setProductModalGame(currentUpdated);
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'មានបញ្ហាក្នុងការបន្ថែមទំនិញ');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបកញ្ចប់ទំនិញនេះមែនទេ?')) return;

    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        showFeedback('success', 'បានលុបទំនិញរួចរាល់');
        // Refresh games
        const updatedGamesRes = await fetch(`${getApiUrl()}/admin/games`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (updatedGamesRes.ok) {
          const items = await updatedGamesRes.json();
          const all = items.data || items;
          setGames(all);
          if (productModalGame) {
            const currentUpdated = all.find((g: GameItem) => g.id === productModalGame.id);
            if (currentUpdated) setProductModalGame(currentUpdated);
          }
        }
      }
    } catch {
      showFeedback('error', 'បរាជ័យក្នុងការលុបទំនិញ');
    }
  };

  const handleToggleProductStatus = async (product: ProductItem) => {
    const nextStatus = product.status === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE';
    try {
      const authToken = getAuthToken();
      const res = await fetch(`${getApiUrl()}/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        showFeedback('success', `បានកែប្រែស្ថានភាពទៅជា ${nextStatus}`);
        const updatedGamesRes = await fetch(`${getApiUrl()}/admin/games`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (updatedGamesRes.ok) {
          const items = await updatedGamesRes.json();
          const all = items.data || items;
          setGames(all);
          if (productModalGame) {
            const currentUpdated = all.find((g: GameItem) => g.id === productModalGame.id);
            if (currentUpdated) setProductModalGame(currentUpdated);
          }
        }
      }
    } catch {
      showFeedback('error', 'បរាជ័យក្នុងការផ្លាស់ប្តូរស្ថានភាព');
    }
  };

  // Filter games
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.name.toLowerCase().includes(search.toLowerCase()) ||
      game.code.toLowerCase().includes(search.toLowerCase()) ||
      (game.category && game.category.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || game.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AuthGuard redirectTo="/register" adminOnly={true}>
      <div className="min-h-screen bg-[#0b0914] text-[#f1f0f7] selection:bg-purple-600 selection:text-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Toast Alert */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xl animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-pink-400" />
                <span>គ្រប់គ្រងហ្គេម & ស្តុកទំនិញ (Games & Stock)</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                បន្ថែមហ្គេមថ្មី, បញ្ចូលរូប Logo ទុកក្នុង VPS, កំណត់ Server ID / Zone ID និងគ្រប់គ្រងកញ្ចប់តម្លៃ Diamonds/UC
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchGames}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-[#16122d] hover:bg-[#201844] border border-[#2d2454] text-xs text-zinc-300 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
                <span>ទាញទិន្នន័យថ្មី</span>
              </button>
              <button
                onClick={openCreateModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-semibold transition shadow-lg shadow-purple-900/30 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>បន្ថែមហ្គេមថ្មី (Add Game)</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            {/* Status tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'ទាំងអស់ (All)' },
                { id: 'ACTIVE', label: 'កំពុងដំណើរការ (Active)' },
                { id: 'MAINTENANCE', label: 'ថែទាំប្រព័ន្ធ (Maintenance)' },
                { id: 'INACTIVE', label: 'បិទដំណើរការ (Inactive)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    statusFilter === tab.id
                      ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1b1536]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ ឬ Code ហ្គេម..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0b0914] border border-[#2d2454] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Games Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <span className="text-xs text-zinc-400">កំពុងទាញទិន្នន័យហ្គេម...</span>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="bg-[#130f26] border border-[#2b2252] rounded-2xl p-12 text-center space-y-4">
              <Gamepad2 className="w-12 h-12 text-zinc-600 mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-white">មិនមានទិន្នន័យហ្គេមត្រូវនឹងការស្វែងរកឡើយ</h3>
                <p className="text-xs text-zinc-400 mt-1">អ្នកអាចបន្ថែមហ្គេមថ្មីដោយចុចប៊ូតុងខាងលើ</p>
              </div>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>បន្ថែមហ្គេមដំបូងរបស់អ្នក</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGames.map((game) => {
                const prodCount = game.products?.length || game._count?.products || 0;
                return (
                  <div
                    key={game.id}
                    className="bg-[#130f26] border border-[#2b2252] hover:border-purple-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group"
                  >
                    <div>
                      {/* Top: Logo & Basic Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-[#0b0914] border border-[#2d2454] p-1 shrink-0 overflow-hidden flex items-center justify-center relative shadow-inner">
                          {game.iconUrl ? (
                            <img
                              src={game.iconUrl}
                              alt={game.name}
                              className="w-full h-full object-cover rounded-xl"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Gamepad2 className="w-7 h-7 text-pink-400/60" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-bold text-white text-sm truncate group-hover:text-pink-300 transition">
                              {game.name}
                            </h3>
                          </div>
                          <div className="text-[11px] font-mono text-purple-300 truncate mt-0.5">
                            {game.code}
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1d163d] text-zinc-300 border border-[#34275a]">
                              {game.category || 'Game'}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                game.status === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : game.status === 'MAINTENANCE'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}
                            >
                              {game.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="mt-4 pt-3 border-t border-[#1e1738] space-y-2 text-xs text-zinc-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-zinc-400">
                            <Server className="w-3.5 h-3.5 text-purple-400" />
                            <span>ត្រូវការ Server ID?</span>
                          </span>
                          <span className={`font-semibold ${game.requiresServerId ? 'text-amber-300' : 'text-zinc-500'}`}>
                            {game.requiresServerId ? `បាទ/ចាស (${game.serverIdLabel || 'Zone'})` : 'មិនត្រូវការ'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-zinc-400">
                            <Layers className="w-3.5 h-3.5 text-pink-400" />
                            <span>កញ្ចប់ទំនិញក្នុងស្តុក:</span>
                          </span>
                          <span className="font-bold text-white bg-purple-900/30 px-2 py-0.5 rounded border border-purple-700/30">
                            {prodCount} កញ្ចប់
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Action Buttons */}
                    <div className="mt-5 pt-3 border-t border-[#1e1738] flex items-center gap-2">
                      <button
                        onClick={() => openProductModal(game)}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>កញ្ចប់តម្លៃ ({prodCount})</span>
                      </button>

                      <button
                        onClick={() => openEditModal(game)}
                        title="កែប្រែហ្គេម"
                        className="p-1.5 rounded-xl bg-[#1a1438] hover:bg-[#251d50] text-zinc-300 border border-[#34275a] transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleGameStatus(game)}
                        title="ប្តូរស្ថានភាព"
                        className="p-1.5 rounded-xl bg-[#1a1438] hover:bg-[#251d50] text-amber-300 border border-[#34275a] transition"
                      >
                        {game.status === 'ACTIVE' ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-zinc-500" />}
                      </button>

                      <button
                        onClick={() => handleDeleteGame(game)}
                        title="លុបហ្គេម"
                        className="p-1.5 rounded-xl bg-[#1a1438] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-[#34275a] hover:border-red-500/30 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODAL: ADD / EDIT GAME */}
          {/* ========================================================= */}
          {gameModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#130f26] border border-[#2b2252] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#231b45] pb-3">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-pink-400" />
                    <h3 className="font-bold text-white text-base">
                      {editingGame ? 'កែប្រែព័ត៌មានហ្គេម (Edit Game)' : 'បន្ថែមហ្គេមថ្មី (Add New Game)'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setGameModalOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-[#201844] text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveGame} className="space-y-4 text-xs">
                  {/* Logo Upload Section */}
                  <div className="bg-[#0b0914] border border-[#261f47] rounded-2xl p-4 space-y-3">
                    <label className="block text-zinc-300 font-medium">រូបតំណាងហ្គេម (Game Logo)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#171233] border border-[#372b66] overflow-hidden flex items-center justify-center shrink-0 relative">
                        {logoPreview || gameFormData.iconUrl ? (
                          <img
                            src={logoPreview || gameFormData.iconUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-zinc-500" />
                        )}
                        {uploadingLogo && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploadingLogo}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1.5 transition text-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingLogo ? 'កំពុង Upload...' : 'ជ្រើសរើសរូបភាពពីម៉ាស៊ីន'}</span>
                        </button>
                        <p className="text-[10px] text-zinc-500">
                          រូបភាពនឹងត្រូវរក្សាទុកក្នុង VPS Disk ដោយស្វ័យប្រវត្ត (PNG, JPG, Max 5MB)
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">ឬបញ្ចូល URL រូបភាពដោយផ្ទាល់:</label>
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={gameFormData.iconUrl}
                        onChange={(e) => {
                          setGameFormData({ ...gameFormData, iconUrl: e.target.value });
                          setLogoPreview(e.target.value);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#130f26] border border-[#2d2454] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Game Name & Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-300 font-medium mb-1">ឈ្មោះហ្គេម (Game Name) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Free Fire, Mobile Legends"
                        value={gameFormData.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGameFormData({
                            ...gameFormData,
                            name: val,
                            // Auto slug if creating
                            code: !editingGame ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : gameFormData.code,
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-medium mb-1">លេខកូដ Code / Slug *</label>
                      <input
                        type="text"
                        required
                        disabled={!!editingGame}
                        placeholder="e.g. free-fire"
                        value={gameFormData.code}
                        onChange={(e) => setGameFormData({ ...gameFormData, code: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white font-mono focus:outline-none focus:border-purple-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Category & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-300 font-medium mb-1">ប្រភេទ (Category)</label>
                      <input
                        type="text"
                        placeholder="e.g. Mobile Games, MOBA, Battle Royale"
                        value={gameFormData.category}
                        onChange={(e) => setGameFormData({ ...gameFormData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-medium mb-1">ស្ថានភាព (Status)</label>
                      <select
                        value={gameFormData.status}
                        onChange={(e) => setGameFormData({ ...gameFormData, status: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0914] border border-[#2d2454] text-sm text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="ACTIVE">ACTIVE (ដំណើរការធម្មតា)</option>
                        <option value="MAINTENANCE">MAINTENANCE (កំពុងថែទាំ)</option>
                        <option value="INACTIVE">INACTIVE (បិទដំណើរការ)</option>
                      </select>
                    </div>
                  </div>

                  {/* Server ID & Player ID settings */}
                  <div className="bg-[#0b0914] border border-[#261f47] rounded-2xl p-4 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gameFormData.requiresServerId}
                        onChange={(e) => setGameFormData({ ...gameFormData, requiresServerId: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-600 bg-[#16122d] border-[#2d2454] focus:ring-0"
                      />
                      <span className="text-zinc-200 font-medium">ហ្គេមនេះតម្រូវឱ្យមាន Server ID / Zone ID (ដូចជា MLBB)</span>
                    </label>

                    {gameFormData.requiresServerId && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-zinc-400 text-[11px] mb-1">Server ID Label</label>
                          <input
                            type="text"
                            value={gameFormData.serverIdLabel}
                            onChange={(e) => setGameFormData({ ...gameFormData, serverIdLabel: e.target.value })}
                            placeholder="Zone ID"
                            className="w-full px-3 py-1.5 rounded-xl bg-[#130f26] border border-[#2d2454] text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 text-[11px] mb-1">Player ID Label</label>
                          <input
                            type="text"
                            value={gameFormData.playerIdLabel}
                            onChange={(e) => setGameFormData({ ...gameFormData, playerIdLabel: e.target.value })}
                            placeholder="User ID"
                            className="w-full px-3 py-1.5 rounded-xl bg-[#130f26] border border-[#2d2454] text-xs text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGameModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[#1a1438] hover:bg-[#251d50] text-zinc-300 font-semibold text-xs transition"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="submit"
                      disabled={savingGame}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-purple-900/30 disabled:opacity-50"
                    >
                      {savingGame && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{editingGame ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតហ្គេមថ្មី'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODAL: MANAGE PRODUCTS (DENOMINATIONS) */}
          {/* ========================================================= */}
          {productModalGame && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#130f26] border border-[#2b2252] rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#231b45] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0b0914] border border-[#2d2454] overflow-hidden flex items-center justify-center shrink-0">
                      {productModalGame.iconUrl ? (
                        <img src={productModalGame.iconUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Gamepad2 className="w-5 h-5 text-pink-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        គ្រប់គ្រងកញ្ចប់តម្លៃ: {productModalGame.name}
                      </h3>
                      <p className="text-[11px] font-mono text-purple-300">{productModalGame.code}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setProductModalGame(null)}
                    className="p-1.5 rounded-xl hover:bg-[#201844] text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Add New Product Form */}
                <div className="bg-[#0b0914] border border-[#28204e] rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>បន្ថែមទំនិញ/កញ្ចប់ថ្មី (Add New Product / Denomination)</span>
                  </h4>

                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">Code សម្គាល់ *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ff-100, ml-86"
                        value={productFormData.code}
                        onChange={(e) => setProductFormData({ ...productFormData, code: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#130f26] border border-[#2d2454] text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">ឈ្មោះកញ្ចប់ទំនិញ *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 100 Diamonds"
                        value={productFormData.name}
                        onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#130f26] border border-[#2d2454] text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">តម្លៃដើម Provider Cost ($)</label>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="0.80"
                        value={productFormData.providerPrice}
                        onChange={(e) => setProductFormData({ ...productFormData, providerPrice: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#130f26] border border-[#2d2454] text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">តម្លៃលក់ Reseller Price ($) *</label>
                      <input
                        type="number"
                        step="0.0001"
                        required
                        placeholder="1.00"
                        value={productFormData.resellerPrice}
                        onChange={(e) => setProductFormData({ ...productFormData, resellerPrice: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#130f26] border border-[#2d2454] text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Provider Item Code (Optional, e.g. provider_diamond_100)"
                          value={productFormData.providerProductId}
                          onChange={(e) => setProductFormData({ ...productFormData, providerProductId: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#130f26] border border-[#2d2454] text-white text-xs font-mono"
                        />
                      </div>
                      <select
                        value={productFormData.status}
                        onChange={(e) => setProductFormData({ ...productFormData, status: e.target.value as any })}
                        className="px-3 py-2 rounded-xl bg-[#130f26] border border-[#2d2454] text-white text-xs"
                      >
                        <option value="AVAILABLE">AVAILABLE (មានស្តុក)</option>
                        <option value="OUT_OF_STOCK">OUT OF STOCK (ដាច់ស្តុក)</option>
                        <option value="DISABLED">DISABLED (បិទចោល)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                      <button
                        type="submit"
                        disabled={submittingProduct}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 disabled:opacity-50"
                      >
                        {submittingProduct ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>+ បន្ថែមកញ្ចប់</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Products List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs">
                      បញ្ជីកញ្ចប់ទំនិញទាំងអស់ ({productModalGame.products?.length || 0})
                    </h4>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#241c45]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0d0a1b] text-zinc-400 font-semibold uppercase text-[10px] border-b border-[#241c45]">
                        <tr>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">ឈ្មោះកញ្ចប់</th>
                          <th className="py-2.5 px-3">តម្លៃ Provider</th>
                          <th className="py-2.5 px-3">តម្លៃ Reseller</th>
                          <th className="py-2.5 px-3">ចំណេញ (Margin)</th>
                          <th className="py-2.5 px-3">ស្ថានភាព</th>
                          <th className="py-2.5 px-3 text-right">សកម្មភាព</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e1738]">
                        {productModalGame.products && productModalGame.products.length > 0 ? (
                          productModalGame.products.map((p) => {
                            const cost = parseFloat(p.providerPrice || '0');
                            const sell = parseFloat(p.resellerPrice || '0');
                            const margin = sell - cost;
                            return (
                              <tr key={p.id} className="hover:bg-[#181330] transition">
                                <td className="py-2.5 px-3 font-mono font-medium text-purple-300">{p.code}</td>
                                <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                                <td className="py-2.5 px-3 font-mono text-zinc-400">${cost.toFixed(4)}</td>
                                <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">${sell.toFixed(4)}</td>
                                <td className="py-2.5 px-3 font-mono text-amber-300">
                                  +${margin.toFixed(4)}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      p.status === 'AVAILABLE'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : p.status === 'OUT_OF_STOCK'
                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                                    }`}
                                  >
                                    {p.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right space-x-1.5">
                                  <button
                                    onClick={() => handleToggleProductStatus(p)}
                                    title="ប្តូរស្ថានភាពស្តុក"
                                    className="p-1 rounded-lg bg-[#201844] hover:bg-[#2c225d] text-zinc-300 transition"
                                  >
                                    {p.status === 'AVAILABLE' ? (
                                      <ToggleRight className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <ToggleLeft className="w-3.5 h-3.5 text-zinc-500" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    title="លុបទំនិញ"
                                    className="p-1 rounded-lg bg-[#201844] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-zinc-500">
                              មិនទាន់មានកញ្ចប់ទំនិញនៅឡើយទេ។ សូមបន្ថែមទម្រង់ខាងលើ!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
