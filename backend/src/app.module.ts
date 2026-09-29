import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ProviderModule } from './provider/provider.module';
import { BalanceModule } from './balance/balance.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { ResellerModule } from './reseller/reseller.module';
import { AdminModule } from './admin/admin.module';
import { CommonModule } from './common/common.module';
import { CheckIdModule } from './check-id/check-id.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    CommonModule,
    HealthModule,
    AuthModule,
    ProviderModule,
    BalanceModule,
    CheckIdModule,
    CatalogModule,
    OrdersModule,
    TransactionsModule,
    ApiKeysModule,
    ResellerModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
