import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(' Connected to PostgreSQL database successfully.');
    } catch (error) {
      this.logger.warn(
        '⚠️ PostgreSQL connection could not be established at startup. Please verify DATABASE_URL in .env and ensure PostgreSQL is running.',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
