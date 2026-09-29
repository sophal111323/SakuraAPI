import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import * as crypto from 'crypto';
import { ApiKeyEnvironment, ApiKeyStatus } from '@prisma/client';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async createApiKey(resellerId: string, dto: CreateApiKeyDto) {
    const env = dto.environment || ApiKeyEnvironment.LIVE;
    const prefix = env === ApiKeyEnvironment.LIVE ? 'sk_live_' : 'sk_test_';
    
    // Generate secure 32-byte hex key
    const randomHex = crypto.randomBytes(24).toString('hex');
    const fullKey = `${prefix}${randomHex}`;
    const keyPrefix = `${prefix}${randomHex.substring(0, 7)}...`;
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

    const apiKey = await this.prisma.apiKey.create({
      data: {
        resellerId,
        name: dto.name.trim(),
        keyPrefix,
        keyHash,
        environment: env,
        status: ApiKeyStatus.ACTIVE,
        rateLimitPerMinute: 100,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      environment: apiKey.environment,
      status: apiKey.status,
      rateLimitPerMinute: apiKey.rateLimitPerMinute,
      createdAt: apiKey.createdAt,
      // The full key is ONLY returned in this response and never stored
      fullKey,
      warning: 'Store this API key securely. It will not be shown again.',
    };
  }

  async getResellerKeys(resellerId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { resellerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        environment: true,
        status: true,
        rateLimitPerMinute: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return keys;
  }

  async revokeKey(resellerId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id: keyId, resellerId },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    if (key.status === ApiKeyStatus.REVOKED) {
      throw new BadRequestException('API key is already revoked');
    }

    const updated = await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { status: ApiKeyStatus.REVOKED },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
