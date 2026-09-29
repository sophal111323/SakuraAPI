import { Module } from '@nestjs/common';
import { CheckIdController } from './check-id.controller';
import { ProviderModule } from '../provider/provider.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ProviderModule, PrismaModule, AuthModule],
  controllers: [CheckIdController],
})
export class CheckIdModule {}
