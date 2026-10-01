import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BalanceService } from '../balance/balance.service';
import { ResellerQueryDto } from './dto/reseller-query.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { LogsQueryDto } from './dto/logs-query.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, ResellerStatus, TransactionType, GameStatus, ProductStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly balanceService: BalanceService,
  ) {}

  /**
   * System-wide KPI dashboard metrics
   */
  async getDashboardStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalResellers,
      activeResellers,
      totalOrders,
      totalSpentAgg,
      todayOrders,
      todayRevenueAgg,
      successfulOrders,
      failedOrders,
      pendingOrders,
      totalBalanceAgg,
      totalApiRequests,
      recentOrders,
      recentAuditActions,
    ] = await Promise.all([
      this.prisma.reseller.count(),
      this.prisma.reseller.count({ where: { status: 'ACTIVE' } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.order.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      this.prisma.order.count({ where: { status: 'SUCCESS' } }),
      this.prisma.order.count({ where: { status: 'FAILED' } }),
      this.prisma.order.count({
        where: { status: { in: ['PENDING', 'PROCESSING'] } },
      }),
      this.prisma.reseller.aggregate({
        _sum: { balance: true },
      }),
      this.prisma.apiRequestLog.count(),
      this.prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          game: { select: { name: true } },
          product: { select: { name: true } },
          reseller: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      }),
      this.prisma.adminAction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { name: true, email: true } },
        },
      }),
    ]);

    return {
      kpi: {
        totalResellers,
        activeResellers,
        totalOrders,
        totalSpent: (totalSpentAgg._sum.amount || 0).toString(),
        todayOrders,
        todayRevenue: (todayRevenueAgg._sum.amount || 0).toString(),
        successfulOrders,
        failedOrders,
        pendingOrders,
        totalResellerBalance: (totalBalanceAgg._sum.balance || 0).toString(),
        totalApiRequests,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        resellerName: o.reseller.user.name,
        resellerEmail: o.reseller.user.email,
        game: o.game.name,
        product: o.product.name,
        amount: o.amount.toString(),
        status: o.status,
        createdAt: o.createdAt,
      })),
      recentAuditActions: recentAuditActions.map((a) => ({
        id: a.id,
        adminName: a.admin.name,
        action: a.action,
        targetEntity: a.targetEntity,
        targetId: a.targetId,
        details: a.details,
        createdAt: a.createdAt,
      })),
    };
  }

  /**
   * List resellers with filters and pagination
   */
  async getResellers(query: ResellerQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 15));
    const skip = (page - 1) * limit;

    const where: Prisma.ResellerWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { companyName: { contains: s, mode: 'insensitive' } },
        { user: { name: { contains: s, mode: 'insensitive' } } },
        { user: { email: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [total, resellers] = await Promise.all([
      this.prisma.reseller.count({ where }),
      this.prisma.reseller.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, status: true } },
          _count: {
            select: { orders: true, apiKeys: true },
          },
        },
      }),
    ]);

    return {
      items: resellers.map((r) => ({
        id: r.id,
        userId: r.userId,
        name: r.user.name,
        email: r.user.email,
        companyName: r.companyName,
        balance: r.balance.toString(),
        currency: r.currency,
        status: r.status,
        pricingTier: r.pricingTier,
        markupPercentage: r.markupPercentage.toString(),
        fixedMarkup: r.fixedMarkup.toString(),
        ordersCount: r._count.orders,
        apiKeysCount: r._count.apiKeys,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Reseller detailed profile with full activity breakdown
   */
  async getResellerDetail(id: string) {
    const reseller = await this.prisma.reseller.findUnique({
      where: { id },
      include: {
        user: true,
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
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            game: { select: { name: true } },
            product: { select: { name: true } },
          },
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { orders: true, transactions: true, apiKeys: true },
        },
      },
    });

    if (!reseller) {
      throw new NotFoundException(`Reseller '${id}' not found`);
    }

    const [totalSpentAgg, successfulOrdersCount] = await Promise.all([
      this.prisma.order.aggregate({
        where: { resellerId: id, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.order.count({
        where: { resellerId: id, status: 'SUCCESS' },
      }),
    ]);

    return {
      id: reseller.id,
      user: {
        id: reseller.user.id,
        name: reseller.user.name,
        email: reseller.user.email,
        status: reseller.user.status,
      },
      companyName: reseller.companyName,
      balance: reseller.balance.toString(),
      currency: reseller.currency,
      status: reseller.status,
      pricingTier: reseller.pricingTier,
      markupPercentage: reseller.markupPercentage.toString(),
      fixedMarkup: reseller.fixedMarkup.toString(),
      metrics: {
        totalOrders: reseller._count.orders,
        successfulOrders: successfulOrdersCount,
        totalSpent: (totalSpentAgg._sum.amount || 0).toString(),
        totalTransactions: reseller._count.transactions,
        totalApiKeys: reseller._count.apiKeys,
      },
      apiKeys: reseller.apiKeys,
      recentOrders: reseller.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        game: o.game.name,
        product: o.product.name,
        amount: o.amount.toString(),
        status: o.status,
        createdAt: o.createdAt,
      })),
      recentTransactions: reseller.transactions.map((tx) => ({
        id: tx.id,
        transactionNumber: tx.transactionNumber,
        amount: tx.amount.toString(),
        type: tx.type,
        status: tx.status,
        note: tx.note,
        createdAt: tx.createdAt,
      })),
      createdAt: reseller.createdAt,
      updatedAt: reseller.updatedAt,
    };
  }

  /**
   * Update reseller status (Activate / Suspend)
   */
  async updateResellerStatus(id: string, status: ResellerStatus, adminId: string, ipAddress?: string) {
    const reseller = await this.prisma.reseller.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!reseller) {
      throw new NotFoundException(`Reseller '${id}' not found`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.reseller.update({
        where: { id },
        data: { status },
      });

      // Keep user status in sync
      await tx.user.update({
        where: { id: reseller.userId },
        data: { status: status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED' },
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'UPDATE_RESELLER_STATUS',
          targetEntity: 'Reseller',
          targetId: id,
          details: { previousStatus: reseller.status, newStatus: status },
          ipAddress,
        },
      });

      return res;
    });

    return updated;
  }

  /**
   * Configure custom reseller pricing markups
   */
  async updateResellerPricing(id: string, dto: UpdatePricingDto, adminId: string, ipAddress?: string) {
    const reseller = await this.prisma.reseller.findUnique({ where: { id } });
    if (!reseller) {
      throw new NotFoundException(`Reseller '${id}' not found`);
    }

    const data: Prisma.ResellerUpdateInput = {};
    if (dto.markupPercentage !== undefined) {
      data.markupPercentage = dto.markupPercentage;
    }
    if (dto.fixedMarkup !== undefined) {
      data.fixedMarkup = dto.fixedMarkup;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.reseller.update({
        where: { id },
        data,
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'UPDATE_RESELLER_PRICING',
          targetEntity: 'Reseller',
          targetId: id,
          details: {
            markupPercentage: dto.markupPercentage,
            fixedMarkup: dto.fixedMarkup,
          },
          ipAddress,
        },
      });

      return res;
    });

    return updated;
  }

  /**
   * Adjust reseller balance with immutable transaction and admin action log
   */
  async adjustBalance(dto: AdjustBalanceDto, adminId: string, ipAddress?: string) {
    const amount = dto.type === TransactionType.ADMIN_DEBIT ? -Math.abs(dto.amount) : Math.abs(dto.amount);

    const result = await this.balanceService.adjustBalance(
      dto.resellerId,
      amount,
      adminId,
      dto.type,
      dto.note,
    );

    // Record admin audit action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'ADJUST_BALANCE',
        targetEntity: 'Reseller',
        targetId: dto.resellerId,
        details: {
          type: dto.type,
          amount: dto.amount,
          previousBalance: result.previousBalance,
          newBalance: result.newBalance,
          note: dto.note,
          transactionNumber: result.transaction.transactionNumber,
        },
        ipAddress,
      },
    });

    return result;
  }

  /**
   * Get API request logs with filtering
   */
  async getApiLogs(query: LogsQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ApiRequestLogWhereInput = {};
    if (query.endpoint) {
      where.endpoint = { contains: query.endpoint, mode: 'insensitive' };
    }
    if (query.statusCode) {
      where.statusCode = query.statusCode;
    }
    if (query.resellerId) {
      where.resellerId = query.resellerId;
    }

    const [total, logs] = await Promise.all([
      this.prisma.apiRequestLog.count({ where }),
      this.prisma.apiRequestLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reseller: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      }),
    ]);

    return {
      items: logs.map((l) => ({
        id: l.id,
        requestId: l.requestId,
        resellerName: l.reseller?.user?.name || 'Anonymous',
        endpoint: l.endpoint,
        httpMethod: l.httpMethod,
        statusCode: l.statusCode,
        responseTimeMs: l.responseTimeMs,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        errorMessage: l.errorMessage,
        createdAt: l.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // GAME & PRODUCT CATALOG MANAGEMENT
  // ==========================================

  async getGames() {
    const games = await this.prisma.game.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        products: {
          orderBy: { resellerPrice: 'asc' },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    return games.map((g) => ({
      id: g.id,
      code: g.code,
      name: g.name,
      category: g.category || 'General',
      iconUrl: g.iconUrl,
      requiresServerId: g.requiresServerId,
      serverIdLabel: g.serverIdLabel,
      playerIdLabel: g.playerIdLabel,
      status: g.status,
      ordersCount: g._count.orders,
      productsCount: g.products.length,
      products: g.products.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        resellerPrice: Number(p.resellerPrice),
        providerPrice: Number(p.providerPrice),
        status: p.status,
        providerProductId: p.providerProductId,
        createdAt: p.createdAt,
      })),
      createdAt: g.createdAt,
    }));
  }

  async createGame(dto: CreateGameDto) {
    const cleanCode = dto.code.toLowerCase().trim().replace(/[_\s]/g, '-');
    const existing = await this.prisma.game.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      throw new ConflictException(`Game code '${cleanCode}' already exists`);
    }

    return this.prisma.game.create({
      data: {
        code: cleanCode,
        name: dto.name.trim(),
        category: dto.category?.trim() || 'General',
        iconUrl: dto.iconUrl?.trim() || null,
        requiresServerId: Boolean(dto.requiresServerId),
        serverIdLabel: dto.serverIdLabel?.trim() || 'Server ID',
        playerIdLabel: dto.playerIdLabel?.trim() || 'Player ID',
        status: dto.status || GameStatus.ACTIVE,
      },
      include: {
        products: true,
      },
    });
  }

  async updateGame(id: string, dto: UpdateGameDto) {
    const game = await this.prisma.game.findUnique({ where: { id } });
    if (!game) {
      throw new NotFoundException(`Game not found`);
    }

    return this.prisma.game.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.category ? { category: dto.category.trim() } : {}),
        ...(dto.iconUrl !== undefined ? { iconUrl: dto.iconUrl } : {}),
        ...(dto.requiresServerId !== undefined ? { requiresServerId: dto.requiresServerId } : {}),
        ...(dto.serverIdLabel ? { serverIdLabel: dto.serverIdLabel.trim() } : {}),
        ...(dto.playerIdLabel ? { playerIdLabel: dto.playerIdLabel.trim() } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
      include: {
        products: true,
      },
    });
  }

  async deleteGame(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game._count.orders > 0) {
      return this.prisma.game.update({
        where: { id },
        data: { status: GameStatus.INACTIVE },
      });
    }

    return this.prisma.game.delete({ where: { id } });
  }

  async createProduct(gameId: string, dto: CreateProductDto) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const cleanCode = dto.code.toLowerCase().trim();
    const existing = await this.prisma.product.findUnique({
      where: {
        gameId_code: {
          gameId,
          code: cleanCode,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Product code '${cleanCode}' already exists for ${game.name}`);
    }

    return this.prisma.product.create({
      data: {
        gameId,
        code: cleanCode,
        name: dto.name.trim(),
        resellerPrice: dto.resellerPrice,
        providerPrice: dto.providerPrice ?? dto.resellerPrice,
        providerProductId: dto.providerProductId?.trim() || null,
        status: dto.status || ProductStatus.AVAILABLE,
      },
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.resellerPrice !== undefined ? { resellerPrice: dto.resellerPrice } : {}),
        ...(dto.providerPrice !== undefined ? { providerPrice: dto.providerPrice } : {}),
        ...(dto.providerProductId !== undefined ? { providerProductId: dto.providerProductId } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
    });
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product._count.orders > 0) {
      return this.prisma.product.update({
        where: { id },
        data: { status: ProductStatus.DISABLED },
      });
    }

    return this.prisma.product.delete({ where: { id } });
  }

  async uploadGameLogo(base64Data: string, gameCode?: string): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const dir = path.resolve(process.cwd(), 'uploads', 'games');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const cleanCode = (gameCode || `game_${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const filename = `${cleanCode}_${Date.now()}.png`;
    const filePath = path.join(dir, filename);

    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    fs.writeFileSync(filePath, buffer);

    return `/api/v1/avatar/games/${filename}`;
  }
}
