import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const rawTg = dto.telegram.trim();
    const cleanTg = rawTg.startsWith('@') ? rawTg : `@${rawTg}`;
    const strippedTg = rawTg.replace(/^@/, '');

    // Check if Telegram account is already used
    const existingTg = await this.prisma.user.findFirst({
      where: {
        OR: [
          { telegram: rawTg },
          { telegram: cleanTg },
          { telegram: strippedTg },
        ],
      },
    });

    if (existingTg) {
      throw new ConflictException('This Telegram account is already registered. Please sign in or use another account.');
    }

    // Determine email (use provided or auto-generate based on telegram)
    const userEmail = dto.email?.trim()
      ? dto.email.toLowerCase().trim()
      : `${strippedTg.toLowerCase()}@telegram.jasmintopup.site`;

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (existingEmail) {
      throw new ConflictException('Email is already registered. Please provide another email or leave it blank.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Atomically create user and reseller record
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: userEmail,
          telegram: cleanTg,
          passwordHash,
          name: dto.name.trim(),
          role: Role.RESELLER,
          status: UserStatus.ACTIVE,
        },
      });

      const reseller = await tx.reseller.create({
        data: {
          userId: user.id,
          companyName: dto.companyName?.trim() || null,
          telegram: cleanTg,
          balance: 0.0,
          currency: 'USD',
        },
      });

      return { user, reseller };
    });

    const token = this.generateToken(result.user);

    return {
      accessToken: token,
      user: {
        id: result.user.id,
        email: result.user.email,
        telegram: result.user.telegram,
        name: result.user.name,
        role: result.user.role,
        status: result.user.status,
      },
      reseller: {
        id: result.reseller.id,
        balance: result.reseller.balance.toString(),
        currency: result.reseller.currency,
        companyName: result.reseller.companyName,
        telegram: result.reseller.telegram,
      },
    };
  }

  async login(dto: LoginDto) {
    const rawId = dto.email.trim();
    const withAt = rawId.startsWith('@') ? rawId : `@${rawId}`;
    const withoutAt = rawId.replace(/^@/, '');
    const fallbackEmail = `${withoutAt.toLowerCase()}@telegram.jasmintopup.site`;

    // Find by Email, Telegram handle, or Telegram fallback email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: rawId.toLowerCase() },
          { telegram: rawId },
          { telegram: withAt },
          { telegram: withoutAt },
          { email: fallbackEmail },
        ],
      },
      include: { reseller: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email/Telegram account or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email/Telegram account or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is suspended or pending activation');
    }

    const token = this.generateToken(user);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        telegram: user.telegram,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      reseller: user.reseller
        ? {
            id: user.reseller.id,
            balance: user.reseller.balance.toString(),
            currency: user.reseller.currency,
            companyName: user.reseller.companyName,
            telegram: user.reseller.telegram,
          }
        : null,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        reseller: {
          include: {
            apiKeys: {
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
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      id: user.id,
      email: user.email,
      telegram: user.telegram,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      reseller: user.reseller
        ? {
            id: user.reseller.id,
            companyName: user.reseller.companyName,
            telegram: user.reseller.telegram,
            balance: user.reseller.balance.toString(),
            currency: user.reseller.currency,
            pricingTier: user.reseller.pricingTier,
            markupPercentage: user.reseller.markupPercentage.toString(),
            fixedMarkup: user.reseller.fixedMarkup.toString(),
            apiKeysCount: user.reseller.apiKeys.length,
            apiKeys: user.reseller.apiKeys,
          }
        : null,
    };
  }

  private generateToken(user: { id: string; email: string; role: Role }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
