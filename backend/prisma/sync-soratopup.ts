import { PrismaClient, ProductStatus, GameStatus } from '@prisma/client';

const prisma = new PrismaClient();
const SORA_API_KEY = process.env.SORATOPUP_API_KEY || 'sk_ad0001261f143a7087c74da6d726307b9df9a2fb81cd9399';
const SORA_BASE_URL = process.env.SORATOPUP_BASE_URL || 'https://soratopup.com/api/v1';

interface SoraGameTarget {
  soraCode: string;
  internalCode: string;
  name: string;
  category: string;
  iconUrl: string;
  requiresServerId: boolean;
  serverIdLabel?: string;
  playerIdLabel: string;
  prefix: string;
}

const TARGET_GAMES: SoraGameTarget[] = [
  {
    soraCode: 'ff',
    internalCode: 'free-fire',
    name: 'Free Fire',
    category: 'Battle Royale',
    iconUrl: 'https://soratopup.com/uploads/g_6fa47f2c181a0f5c.jpg',
    requiresServerId: false,
    playerIdLabel: 'Player ID (UID)',
    prefix: 'ff',
  },
  {
    soraCode: 'ml',
    internalCode: 'mobile-legends',
    name: 'Mobile Legends: Bang Bang',
    category: 'MOBA',
    iconUrl: 'https://soratopup.com/uploads/g_8cd8aa7b5f110762.jpg',
    requiresServerId: true,
    serverIdLabel: 'Zone ID (4-5 digits)',
    playerIdLabel: 'User ID (8-10 digits)',
    prefix: 'ml',
  },
  {
    soraCode: 'pubgm',
    internalCode: 'pubg-mobile',
    name: 'PUBG Mobile Global',
    category: 'Battle Royale',
    iconUrl: 'https://bay2game.xyz/api/uploads/PUBGM-App.png',
    requiresServerId: false,
    playerIdLabel: 'Character ID (UID)',
    prefix: 'pubg',
  },
  {
    soraCode: 'genshinimpactglobal2',
    internalCode: 'genshin-impact',
    name: 'Genshin Impact',
    category: 'RPG',
    iconUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=128&auto=format&fit=crop&q=80',
    requiresServerId: true,
    serverIdLabel: 'Server (os_asia, os_usa, os_euro, os_cht)',
    playerIdLabel: 'UID (9 digits)',
    prefix: 'gi',
  },
  {
    soraCode: 'hok',
    internalCode: 'honor-of-kings',
    name: 'Honor of Kings',
    category: 'MOBA',
    iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=128&auto=format&fit=crop&q=80',
    requiresServerId: false,
    playerIdLabel: 'Player ID (UID)',
    prefix: 'hok',
  },
];

async function syncGame(target: SoraGameTarget) {
  console.log(`\n========================================`);
  console.log(`🌸 Syncing game: ${target.name} (${target.soraCode} -> ${target.internalCode})...`);

  // 1. Upsert Game record
  const game = await prisma.game.upsert({
    where: { code: target.internalCode },
    update: {
      name: target.name,
      category: target.category,
      iconUrl: target.iconUrl,
      requiresServerId: target.requiresServerId,
      serverIdLabel: target.serverIdLabel,
      playerIdLabel: target.playerIdLabel,
      status: GameStatus.ACTIVE,
      lastSyncedAt: new Date(),
    },
    create: {
      code: target.internalCode,
      name: target.name,
      category: target.category,
      iconUrl: target.iconUrl,
      requiresServerId: target.requiresServerId,
      serverIdLabel: target.serverIdLabel,
      playerIdLabel: target.playerIdLabel,
      status: GameStatus.ACTIVE,
      lastSyncedAt: new Date(),
    },
  });

  // 2. Fetch packages from SoraTopup
  const url = `${SORA_BASE_URL}/packages?game=${encodeURIComponent(target.soraCode)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SORA_API_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`❌ Failed to fetch packages for ${target.soraCode}: HTTP ${res.status}`);
    return;
  }

  const json = await res.json();
  const packages: Array<{ code: string; name: string; price: number }> = json.packages || json.data || [];
  console.log(`📦 Found ${packages.length} packages from SoraTopup for ${target.name}`);

  let upsertCount = 0;
  for (const pkg of packages) {
    const providerPrice = Number(pkg.price);
    if (isNaN(providerPrice) || providerPrice <= 0) continue;

    // 6% markup for reseller margin with min +$0.02
    const resellerPrice = Math.max(
      Number((providerPrice * 1.06).toFixed(2)),
      Number((providerPrice + 0.02).toFixed(2)),
    );

    // Primary code: e.g. ff-100 or ml-86
    const primaryCode = `${target.prefix}-${pkg.code}`.toLowerCase();

    await prisma.product.upsert({
      where: {
        gameId_code: {
          gameId: game.id,
          code: primaryCode,
        },
      },
      update: {
        name: pkg.name,
        providerPrice,
        resellerPrice,
        providerProductId: String(pkg.code),
        status: ProductStatus.AVAILABLE,
      },
      create: {
        gameId: game.id,
        code: primaryCode,
        name: pkg.name,
        providerPrice,
        resellerPrice,
        providerProductId: String(pkg.code),
        status: ProductStatus.AVAILABLE,
      },
    });

    // Also support direct code lookup (e.g. "100" or "86")
    const shortCode = String(pkg.code).toLowerCase();
    if (shortCode !== primaryCode) {
      await prisma.product.upsert({
        where: {
          gameId_code: {
            gameId: game.id,
            code: shortCode,
          },
        },
        update: {
          name: pkg.name,
          providerPrice,
          resellerPrice,
          providerProductId: String(pkg.code),
          status: ProductStatus.AVAILABLE,
        },
        create: {
          gameId: game.id,
          code: shortCode,
          name: pkg.name,
          providerPrice,
          resellerPrice,
          providerProductId: String(pkg.code),
          status: ProductStatus.AVAILABLE,
        },
      });
    }

    upsertCount++;
  }

  console.log(`✓ Successfully synced ${upsertCount} products for ${target.name}`);
}

async function main() {
  console.log('🚀 Starting SoraTopup live catalog synchronization...');
  console.log(`Connecting to: ${SORA_BASE_URL}`);

  // Check balance first
  const balRes = await fetch(`${SORA_BASE_URL}/balance`, {
    headers: { Authorization: `Bearer ${SORA_API_KEY}` },
  });
  if (balRes.ok) {
    const balData = await balRes.json();
    console.log(`💰 Live SoraTopup Balance: $${balData.balance} ${balData.currency || 'USD'}`);
  }

  for (const target of TARGET_GAMES) {
    await syncGame(target);
  }

  console.log('\n🎉 SoraTopup catalog synchronization complete!');
}

main()
  .catch((e) => {
    console.error('Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
