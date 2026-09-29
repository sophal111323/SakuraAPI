import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RateLimitRecord {
  timestamps: number[];
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly storage = new Map<string, RateLimitRecord>();
  private readonly defaultTtl: number;
  private readonly defaultLimit: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultTtl = parseInt(this.configService.get<string>('RATE_LIMIT_TTL') || '60', 10);
    this.defaultLimit = parseInt(this.configService.get<string>('RATE_LIMIT_LIMIT') || '100', 10);

    // Periodically prune stale rate limit buckets every 2 minutes
    const timer = setInterval(() => this.cleanup(), 120000);
    if (timer && typeof timer.unref === 'function') {
      timer.unref();
    }
  }

  /**
   * Checks if an identifier exceeds the sliding-window rate limit
   */
  checkRateLimit(
    identifier: string,
    customLimit?: number,
    customTtl?: number,
  ): {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    const limit = customLimit || this.defaultLimit;
    const ttlMs = (customTtl || this.defaultTtl) * 1000;
    const windowStart = now - ttlMs;

    let record = this.storage.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.storage.set(identifier, record);
    }

    // Filter timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestInWindow = record.timestamps[0];
      const resetInSeconds = Math.max(1, Math.ceil((oldestInWindow + ttlMs - now) / 1000));
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetInSeconds,
      };
    }

    // Record this request
    record.timestamps.push(now);
    const remaining = Math.max(0, limit - record.timestamps.length);
    const resetInSeconds = Math.ceil(ttlMs / 1000);

    return {
      allowed: true,
      limit,
      remaining,
      resetInSeconds,
    };
  }

  private cleanup() {
    const now = Date.now();
    const maxAge = this.defaultTtl * 1000;
    for (const [key, record] of this.storage.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > now - maxAge);
      if (record.timestamps.length === 0) {
        this.storage.delete(key);
      }
    }
  }
}
