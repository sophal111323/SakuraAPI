import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameQueryDto } from './dto/game-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getGames(query: GameQueryDto) {
    const where: Prisma.GameWhereInput = {
      status: 'ACTIVE',
    };

    if (query.category) {
      where.category = { equals: query.category, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const games = await this.prisma.game.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return games.map((g) => ({
      id: g.id,
      code: g.code,
      name: g.name,
      category: g.category,
      iconUrl: g.iconUrl,
      requiresServerId: g.requiresServerId,
      serverIdLabel: g.serverIdLabel,
      playerIdLabel: g.playerIdLabel,
      status: g.status,
      productCount: g._count.products,
      updatedAt: g.updatedAt,
    }));
  }

  async getGameByCode(code: string) {
    const game = await this.prisma.game.findUnique({
      where: { code: code.toLowerCase().trim() },
      include: {
        products: {
          where: { status: 'AVAILABLE' },
          orderBy: { resellerPrice: 'asc' },
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`Game '${code}' not found`);
    }

    return game;
  }

  async getProductsByGame(gameCode: string, resellerId?: string) {
    const game = await this.prisma.game.findUnique({
      where: { code: gameCode.toLowerCase().trim() },
    });

    if (!game) {
      throw new NotFoundException(`Game '${gameCode}' not found`);
    }

    // Check if reseller has custom markup
    let markupPercentage = 0;
    let fixedMarkup = 0;

    if (resellerId) {
      const reseller = await this.prisma.reseller.findUnique({
        where: { id: resellerId },
      });
      if (reseller) {
        markupPercentage = Number(reseller.markupPercentage) || 0;
        fixedMarkup = Number(reseller.fixedMarkup) || 0;
      }
    }

    const products = await this.prisma.product.findMany({
      where: {
        gameId: game.id,
        status: 'AVAILABLE',
      },
      orderBy: { resellerPrice: 'asc' },
    });

    return products.map((p) => {
      const basePrice = Number(p.resellerPrice);
      // Calculate dynamic price based on reseller configuration
      const effectivePrice = Number((basePrice * (1 + markupPercentage / 100) + fixedMarkup).toFixed(4));

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        gameCode: game.code,
        gameName: game.name,
        price: effectivePrice,
        currency: 'USD',
        status: p.status,
        providerPrice: p.providerPrice,
      };
    });
  }
}
