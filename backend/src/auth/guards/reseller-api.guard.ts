import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ResellerApiGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization Bearer token');
    }

    const token = authHeader.substring(7).trim();

    // Case 1: Reseller API Key (sk_live_... / sk_test_...)
    if (token.startsWith('sk_live_') || token.startsWith('sk_test_')) {
      const keyHash = crypto.createHash('sha256').update(token).digest('hex');

      const apiKey = await this.prisma.apiKey.findUnique({
        where: { keyHash },
        include: {
          reseller: {
            include: { user: true },
          },
        },
      });

      if (!apiKey || apiKey.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid or revoked API key');
      }

      if (apiKey.reseller.status !== 'ACTIVE') {
        throw new UnauthorizedException('Reseller account is suspended');
      }

      // Update last used timestamp in background
      this.prisma.apiKey
        .update({
          where: { id: apiKey.id },
          data: { lastUsedAt: new Date() },
        })
        .catch(() => {});

      request.user = {
        id: apiKey.reseller.userId,
        resellerId: apiKey.reseller.id,
        role: 'RESELLER',
        apiKeyId: apiKey.id,
        reseller: apiKey.reseller,
      };

      return true;
    }

    // Case 2: Session JWT Token (from web frontend)
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { reseller: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account suspended or not found');
      }

      request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        resellerId: user.reseller?.id,
        reseller: user.reseller,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication credentials');
    }
  }
}
