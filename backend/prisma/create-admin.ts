import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'kanhatepi2011@gmail.com';
  const password = 'Sophal030511016850400';
  const passwordHash = await bcrypt.hash(password, 10);
  const telegramId = '7301310227';

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      telegramId,
      name: 'Admin Sophal',
    },
    create: {
      email,
      passwordHash,
      name: 'Admin Sophal',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      telegramId,
    },
  });

  // Ensure Reseller record exists so profile queries don't crash
  await prisma.reseller.upsert({
    where: { userId: user.id },
    update: {
      telegramId,
    },
    create: {
      userId: user.id,
      companyName: 'SakuraAPI Administrator',
      balance: 1000.0,
      currency: 'USD',
      pricingTier: 'VIP',
      telegramId,
    },
  });

  console.log(`✅ Admin user successfully created/updated: ${user.email} (ID: ${user.id}, Telegram ID: ${telegramId})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
