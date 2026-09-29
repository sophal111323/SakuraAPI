import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
      },
      reseller: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@sakuraapi.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hash = await bcrypt.hash('CorrectPassword123!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        email: 'user@sakuraapi.com',
        passwordHash: hash,
        status: UserStatus.ACTIVE,
        role: Role.RESELLER,
        reseller: null,
      });

      await expect(
        service.login({ email: 'user@sakuraapi.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is suspended', async () => {
      const hash = await bcrypt.hash('CorrectPassword123!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        email: 'user@sakuraapi.com',
        passwordHash: hash,
        status: UserStatus.SUSPENDED,
        role: Role.RESELLER,
        reseller: null,
      });

      await expect(
        service.login({ email: 'user@sakuraapi.com', password: 'CorrectPassword123!' }),
      ).rejects.toThrow('Account is suspended or pending activation');
    });

    it('should return accessToken and user data on valid login', async () => {
      const hash = await bcrypt.hash('Secret123!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        email: 'user@sakuraapi.com',
        passwordHash: hash,
        name: 'Demo Reseller',
        status: UserStatus.ACTIVE,
        role: Role.RESELLER,
        reseller: {
          id: 'res-1',
          balance: 100.5,
          currency: 'USD',
          companyName: 'Sakura LLC',
        },
      });

      const result = await service.login({ email: 'user@sakuraapi.com', password: 'Secret123!' });
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('user@sakuraapi.com');
      expect(result.reseller?.balance).toBe('100.5');
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'usr-existing' });

      await expect(
        service.register({
          email: 'existing@sakuraapi.com',
          password: 'Password123!',
          name: 'Jane Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create new user and reseller in transaction', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          user: {
            create: vi.fn().mockResolvedValue({
              id: 'usr-new',
              email: 'new@sakuraapi.com',
              name: 'New Reseller',
              role: Role.RESELLER,
              status: UserStatus.ACTIVE,
            }),
          },
          reseller: {
            create: vi.fn().mockResolvedValue({
              id: 'res-new',
              balance: 0,
              currency: 'USD',
              companyName: 'New Ventures',
            }),
          },
        };
        return callback(tx);
      });

      const res = await service.register({
        email: 'new@sakuraapi.com',
        password: 'Password123!',
        name: 'New Reseller',
        companyName: 'New Ventures',
      });

      expect(res.accessToken).toBe('mock-jwt-token');
      expect(res.user.email).toBe('new@sakuraapi.com');
      expect(res.reseller.companyName).toBe('New Ventures');
    });
  });
});
