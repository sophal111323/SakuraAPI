import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RateLimitService } from './rate-limit/rate-limit.service';
import { RateLimitGuard } from './rate-limit/rate-limit.guard';
import { ApiLoggingInterceptor } from './interceptors/api-logging.interceptor';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    RateLimitService,
    RateLimitGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiLoggingInterceptor,
    },
  ],
  exports: [RateLimitService, RateLimitGuard],
})
export class CommonModule {}
