import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'RATE_LIMIT_TTL') return '60';
              if (key === 'RATE_LIMIT_LIMIT') return '3';
              return null;
            },
          },
        },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should allow requests under the limit', () => {
    const key = 'test-client-1';
    const r1 = service.checkRateLimit(key);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = service.checkRateLimit(key);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = service.checkRateLimit(key);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('should reject requests exceeding the limit', () => {
    const key = 'test-client-overflow';
    service.checkRateLimit(key);
    service.checkRateLimit(key);
    service.checkRateLimit(key);

    const r4 = service.checkRateLimit(key);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.resetInSeconds).toBeGreaterThan(0);
  });

  it('should support custom per-reseller limits', () => {
    const key = 'vip-reseller';
    // Custom limit of 10
    for (let i = 0; i < 5; i++) {
      const res = service.checkRateLimit(key, 10);
      expect(res.allowed).toBe(true);
    }
  });
});
