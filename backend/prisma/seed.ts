import {
  PrismaClient,
  Role,
  UserStatus,
  TransactionType,
  TransactionStatus,
  ApiKeyEnvironment,
  ApiKeyStatus,
  GameStatus,
  ProductStatus,
  OrderStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌸 Starting database seed for SakuraAPI...');

  // 1. Seed Admin
  const adminEmail = 'admin@sakuraapi.com';
  const adminPasswordHash = await bcrypt.hash('Admin@Sakura123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: 'Sakura Administrator',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✓ Admin user seeded: ${admin.email}`);

  // 1.1 Seed Primary Admin (kanhatepi2011@gmail.com)
  const primaryAdminEmail = 'kanhatepi2011@gmail.com';
  const primaryAdminPasswordHash = await bcrypt.hash('Sophal030511016850400', 10);
  const primaryAdmin = await prisma.user.upsert({
    where: { email: primaryAdminEmail },
    update: {
      passwordHash: primaryAdminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      telegramId: '7301310227',
      name: 'Admin Sophal',
    },
    create: {
      email: primaryAdminEmail,
      passwordHash: primaryAdminPasswordHash,
      name: 'Admin Sophal',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      telegramId: '7301310227',
    },
  });
  console.log(`✓ Primary Admin seeded: ${primaryAdmin.email}`);

  // 2. Seed Demo Reseller
  const resellerEmail = 'reseller@sakuraapi.com';
  const resellerPasswordHash = await bcrypt.hash('Reseller@Sakura123!', 10);

  let demoUser = await prisma.user.findUnique({
    where: { email: resellerEmail },
    include: { reseller: true },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: resellerEmail,
        passwordHash: resellerPasswordHash,
        name: 'Demo Reseller',
        role: Role.RESELLER,
        status: UserStatus.ACTIVE,
        reseller: {
          create: {
            companyName: 'Sakura Game Hub',
            balance: 0.0,
            currency: 'USD',
            pricingTier: 'DEFAULT',
            markupPercentage: 5.0,
            fixedMarkup: 0.0,
          },
        },
      },
      include: { reseller: true },
    });
    console.log(`✓ Demo Reseller created: ${demoUser.email} (Balance: $0.00)`);
  } else {
    // Ensure existing reseller balance is set to 0
    await prisma.reseller.update({
      where: { id: demoUser.reseller!.id },
      data: { balance: 0.0 },
    });
    console.log(`✓ Demo Reseller exists: ${demoUser.email} (Reset to $0.00)`);
  }

  const reseller = demoUser.reseller!;

  // 3. Seed Demo API Key
  const existingKey = await prisma.apiKey.findFirst({
    where: { resellerId: reseller.id },
  });

  if (!existingKey) {
    const rawDemoKey = 'sakura_reseller_demo_key_example_123';
    const keyHash = crypto.createHash('sha256').update(rawDemoKey).digest('hex');

    await prisma.apiKey.create({
      data: {
        resellerId: reseller.id,
        name: 'Primary Live Key',
        keyPrefix: 'sakura_demo...',
        keyHash,
        environment: ApiKeyEnvironment.LIVE,
        status: ApiKeyStatus.ACTIVE,
        rateLimitPerMinute: 100,
      },
    });
    console.log(`✓ Demo API Key created (Prefix: sk_live_demo123...)`);
  }

  // 4. Seed Games Catalog
  const gamesData = [
    {
      code: 'mobile-legends',
      name: 'Mobile Legends: Bang Bang',
      category: 'MOBA',
      iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=128&auto=format&fit=crop&q=80',
      requiresServerId: true,
      serverIdLabel: 'Zone ID (4 digits)',
      playerIdLabel: 'User ID (e.g. 12345678)',
      products: [
        { code: 'mlbb-86', name: '86 Diamonds', providerPrice: 1.30, resellerPrice: 1.45 },
        { code: 'mlbb-257', name: '257 Diamonds', providerPrice: 3.80, resellerPrice: 4.20 },
        { code: 'mlbb-706', name: '706 Diamonds', providerPrice: 10.20, resellerPrice: 11.00 },
        { code: 'mlbb-pass', name: 'Weekly Diamond Pass', providerPrice: 1.80, resellerPrice: 2.00 },
        { code: 'mlbb-twilight', name: 'Twilight Pass', providerPrice: 8.50, resellerPrice: 9.20 },
      ],
    },
    {
      code: 'free-fire',
      name: 'Garena Free Fire',
      category: 'Battle Royale',
      iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=128&auto=format&fit=crop&q=80',
      requiresServerId: false,
      playerIdLabel: 'Player ID (UID)',
      products: [
        { code: 'ff-100', name: '100 Diamonds', providerPrice: 0.90, resellerPrice: 1.00 },
        { code: 'ff-310', name: '310 Diamonds', providerPrice: 2.70, resellerPrice: 3.00 },
        { code: 'ff-520', name: '520 Diamonds', providerPrice: 4.50, resellerPrice: 4.95 },
        { code: 'ff-1060', name: '1060 Diamonds', providerPrice: 8.90, resellerPrice: 9.80 },
      ],
    },
    {
      code: 'genshin-impact',
      name: 'Genshin Impact',
      category: 'RPG',
      iconUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=128&auto=format&fit=crop&q=80',
      requiresServerId: true,
      serverIdLabel: 'Server (os_usa, os_euro, os_asia, os_cht)',
      playerIdLabel: 'UID (9 digits)',
      products: [
        { code: 'gi-60', name: '60 Genesis Crystals', providerPrice: 0.95, resellerPrice: 1.05 },
        { code: 'gi-330', name: '300+30 Genesis Crystals', providerPrice: 4.60, resellerPrice: 5.00 },
        { code: 'gi-1090', name: '980+110 Genesis Crystals', providerPrice: 14.20, resellerPrice: 15.50 },
        { code: 'gi-welkin', name: 'Blessing of the Welkin Moon', providerPrice: 4.70, resellerPrice: 5.10 },
      ],
    },
    {
      code: 'pubg-mobile',
      name: 'PUBG Mobile',
      category: 'Battle Royale',
      iconUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=128&auto=format&fit=crop&q=80',
      requiresServerId: false,
      playerIdLabel: 'Character ID (UID)',
      products: [
        { code: 'pubg-60', name: '60 Unknown Cash (UC)', providerPrice: 0.90, resellerPrice: 1.00 },
        { code: 'pubg-325', name: '325 Unknown Cash (UC)', providerPrice: 4.50, resellerPrice: 4.95 },
        { code: 'pubg-660', name: '660 Unknown Cash (UC)', providerPrice: 9.10, resellerPrice: 9.90 },
      ],
    },
  ];

  let sampleProductForOrder: any = null;
  let sampleGameForOrder: any = null;

  for (const gameItem of gamesData) {
    const game = await prisma.game.upsert({
      where: { code: gameItem.code },
      update: {
        name: gameItem.name,
        category: gameItem.category,
        requiresServerId: gameItem.requiresServerId,
        serverIdLabel: gameItem.serverIdLabel,
        playerIdLabel: gameItem.playerIdLabel,
      },
      create: {
        code: gameItem.code,
        name: gameItem.name,
        category: gameItem.category,
        iconUrl: gameItem.iconUrl,
        requiresServerId: gameItem.requiresServerId,
        serverIdLabel: gameItem.serverIdLabel,
        playerIdLabel: gameItem.playerIdLabel,
        status: GameStatus.ACTIVE,
      },
    });

    for (const prod of gameItem.products) {
      const createdProd = await prisma.product.upsert({
        where: {
          gameId_code: {
            gameId: game.id,
            code: prod.code,
          },
        },
        update: {
          name: prod.name,
          providerPrice: prod.providerPrice,
          resellerPrice: prod.resellerPrice,
        },
        create: {
          gameId: game.id,
          code: prod.code,
          name: prod.name,
          providerPrice: prod.providerPrice,
          resellerPrice: prod.resellerPrice,
          status: ProductStatus.AVAILABLE,
        },
      });

      if (!sampleProductForOrder) {
        sampleProductForOrder = createdProd;
        sampleGameForOrder = game;
      }
    }
  }
  console.log(`✓ Seeded ${gamesData.length} Game Categories with products`);

  console.log('🌸 Database seed completed successfully (Reseller data starts at 0)!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
