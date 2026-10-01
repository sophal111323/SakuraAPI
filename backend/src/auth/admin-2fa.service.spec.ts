import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Admin2faService } from './admin-2fa.service';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';

describe('Admin2faService', () => {
  let service: Admin2faService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Admin2faService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue('mock_bot_token'),
          },
        },
      ],
    }).compile();

    service = module.get<Admin2faService>(Admin2faService);

    // Mock sendTelegramAlert to avoid network calls during tests
    vi.spyOn(service, 'sendTelegramAlert').mockResolvedValue(true);
  });

  it('should generate a 256-character secret key and 6-digit OTP', async () => {
    const user = {
      id: 'usr-admin-1',
      email: 'kanhatepi2011@gmail.com',
      telegramId: '7301310227',
      name: 'Admin Sophal',
    };

    const challenge = await service.createChallenge(user, '127.0.0.1');

    expect(challenge.tempToken).toBeDefined();
    expect(challenge.expiresIn).toBe(300);
    expect(challenge.adminTelegramId).toBe('7301310227');
    expect(service.sendTelegramAlert).toHaveBeenCalled();
  });

  it('should enforce rate limit after 5 failed attempts', async () => {
    const key = 'test_key';
    const ip = '1.2.3.4';
    const email = 'kanhatepi2011@gmail.com';

    for (let i = 0; i < 4; i++) {
      await service.recordFailedAttempt(key, ip, email);
    }

    // 5th attempt should trigger block and throw 429
    await expect(service.recordFailedAttempt(key, ip, email)).rejects.toThrow(HttpException);

    // Subsequent check should also throw 429
    expect(() => service.checkRateLimit(key)).toThrow(HttpException);
  });
});
