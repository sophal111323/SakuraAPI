import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SoraTopupService } from '../provider/soratopup.service';
import { Bay2GameService } from '../provider/bay2game.service';
import { BalanceService } from '../balance/balance.service';
import { OrderQueryDto } from './dto/order-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly soraTopupService: SoraTopupService,
    private readonly balanceService: BalanceService,
    private readonly bay2gameService: Bay2GameService,
  ) {}

  /**
   * Normalizes game aliases to standard SakuraAPI database game codes
   */
  normalizeGameCode(code: string): string {
    const c = (code || '').toLowerCase().trim().replace(/[_\s]/g, '-');
    const map: Record<string, string> = {
      'mlbb': 'mobile-legends',
      'ml': 'mobile-legends',
      'mobile_legends': 'mobile-legends',
      'mobilelegends': 'mobile-legends',
      'mobile-legends': 'mobile-legends',
      'freefire': 'free-fire',
      'free_fire': 'free-fire',
      'free-fire': 'free-fire',
      'ff': 'free-fire',
      'pubg': 'pubg-mobile',
      'pubgm': 'pubg-mobile',
      'pubg_mobile': 'pubg-mobile',
      'pubg-mobile': 'pubg-mobile',
      'genshin': 'genshin-impact',
      'genshin_impact': 'genshin-impact',
      'genshin-impact': 'genshin-impact',
      'gi': 'genshin-impact',
      'hok': 'honor-of-kings',
      'honor_of_kings': 'honor-of-kings',
      'honor-of-kings': 'honor-of-kings',
      'valorant': 'valorant',
    };
    return map[c] || c;
  }

  /**
   * Reseller automated order creation flow with atomic balance ledger,
   * exhaustive pre-validations (Game, Item, Player, Balance), & SoraTopup dispatch
   */
  async createOrder(resellerId: string, dto: CreateOrderDto, ipAddress?: string) {
    const rawGame = (dto.game || '').trim();
    const rawProduct = (dto.product || '').trim();
    const cleanPlayerId = (dto.player_id || '').trim();
    const cleanServerId = dto.server_id ? dto.server_id.trim() : null;
    const cleanResellerOrderId = dto.reseller_order_id ? dto.reseller_order_id.trim() : null;

    // 1. Strict Game Code & Codegame Validation
    if (!rawGame) {
      throw new BadRequestException({
        code: 'MISSING_GAME',
        message: 'Game code identifier is required',
        field: 'game',
      });
    }

    const normalizedGameCode = this.normalizeGameCode(rawGame);
    const game = await this.prisma.game.findFirst({
      where: {
        OR: [
          { code: normalizedGameCode },
          { code: rawGame.toLowerCase() },
          { id: rawGame },
        ],
      },
    });

    if (!game || game.status !== 'ACTIVE') {
      throw new BadRequestException(`Game '${dto.game}' is invalid or inactive`);
    }

    // 2. Strict Player ID & Server ID Format Validation
    if (!cleanPlayerId || cleanPlayerId.length < 3 || cleanPlayerId.length > 64) {
      throw new BadRequestException({
        code: 'INVALID_PLAYER_ID',
        message: 'Player ID (User ID) is required and must be between 3 and 64 characters',
        field: 'player_id',
      });
    }

    if (game.requiresServerId && !cleanServerId) {
      throw new BadRequestException(
        `Game '${game.name}' requires '${game.serverIdLabel || 'Server ID'}'`,
      );
    }

    // 3. Strict Product / Item ID Validation & Stock Status
    if (!rawProduct) {
      throw new BadRequestException({
        code: 'MISSING_PRODUCT',
        message: 'Product item identifier is required',
        field: 'product',
      });
    }

    const cleanProductLower = rawProduct.toLowerCase();
    const product = await this.prisma.product.findFirst({
      where: {
        gameId: game.id,
        OR: [
          { code: cleanProductLower },
          { code: cleanProductLower.replace(/_/g, '-') },
          { code: cleanProductLower.replace(/-/g, '_') },
          { id: rawProduct },
        ],
      },
    });

    if (!product || product.status !== 'AVAILABLE') {
      throw new BadRequestException(`Product '${dto.product}' is invalid or out of stock`);
    }

    // 4. Idempotency Check (Prevent duplicate charges on network retries)
    if (cleanResellerOrderId) {
      const existing = await this.prisma.order.findUnique({
        where: {
          resellerId_resellerOrderId: {
            resellerId,
            resellerOrderId: cleanResellerOrderId,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Duplicate order: reseller_order_id '${dto.reseller_order_id}' has already been processed`,
        );
      }
    }

    // 5. Strict Reseller Account Status & Final Pricing Calculation
    const reseller = await this.prisma.reseller.findUnique({
      where: { id: resellerId },
    });

    if (!reseller || reseller.status !== 'ACTIVE') {
      throw new BadRequestException({
        code: 'RESELLER_INACTIVE',
        message: 'Reseller account is not active or suspended',
      });
    }

    const markupPct = Number(reseller.markupPercentage) || 0;
    const fixedMarkup = Number(reseller.fixedMarkup) || 0;
    const basePrice = Number(product.resellerPrice);
    const finalAmount = Number((basePrice * (1 + markupPct / 100) + fixedMarkup).toFixed(4));
    const currentBalance = Number(reseller.balance);

    // 6. Pre-flight Balance Verification (Check before deducting or calling provider stock)
    if (currentBalance < finalAmount) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_BALANCE',
        message: `Insufficient balance to complete top-up order. Order total is $${finalAmount.toFixed(2)} ${reseller.currency}, but your available balance is $${currentBalance.toFixed(2)} ${reseller.currency}. Please deposit funds via KHQR.`,
        requiredAmount: finalAmount.toFixed(2),
        currentBalance: currentBalance.toFixed(2),
        shortage: (finalAmount - currentBalance).toFixed(2),
        currency: reseller.currency,
      });
    }

    // 7. Pre-flight Target Player Account Verification (Prevents sending orders to non-existent IDs)
    let verifiedPlayerName: string | null = null;
    try {
      const idCheck = await this.bay2gameService.checkId(
        game.code,
        cleanPlayerId,
        cleanServerId || undefined,
      );

      // If validator explicitly confirmed player ID does NOT exist on game server
      if (
        idCheck &&
        idCheck.valid === false &&
        idCheck.message &&
        !idCheck.message.toLowerCase().includes('timeout') &&
        !idCheck.message.toLowerCase().includes('gateway')
      ) {
        throw new BadRequestException({
          code: 'PLAYER_VERIFICATION_FAILED',
          message: `Player ID '${cleanPlayerId}'${cleanServerId ? ' (Zone ' + cleanServerId + ')' : ''} was verified as INVALID or NOT FOUND for ${game.name}. Order rejected to protect your balance.`,
          details: idCheck.message,
        });
      }

      if (idCheck?.valid && idCheck.username) {
        verifiedPlayerName = idCheck.username;
        this.logger.log(`✓ Verified target player: ${verifiedPlayerName} (${cleanPlayerId})`);
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.warn(`⚠️ Pre-order player ID validation warning: ${err.message}`);
    }

    // 8. Generate Unique SakuraAPI Order Number
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `SK-${datePrefix}-${randSuffix}`;

    // 9. Step 1: Transactionally deduct balance and create initial PENDING order
    const createdOrder = await this.prisma.$transaction(async (tx) => {
      // Deduct balance atomically
      await this.balanceService.deductBalanceForOrder(
        tx,
        resellerId,
        finalAmount,
        orderNumber,
        `Top-up for ${game.name} - ${product.name}${verifiedPlayerName ? ` (${verifiedPlayerName})` : ''}`,
      );

      // Create order
      return tx.order.create({
        data: {
          orderNumber,
          resellerId,
          resellerOrderId: cleanResellerOrderId,
          gameId: game.id,
          productId: product.id,
          playerId: cleanPlayerId,
          serverId: cleanServerId,
          amount: finalAmount,
          providerPrice: product.providerPrice,
          status: OrderStatus.PENDING,
          providerResponse: verifiedPlayerName ? { verified_username: verifiedPlayerName } : {},
          ipAddress,
        },
        include: {
          game: true,
          product: true,
        },
      });
    });

    this.logger.log(`🌸 Created verified order ${createdOrder.orderNumber} for reseller ${resellerId}`);

    // 10. Step 2: Dispatch order to upstream SoraTopup API
    const providerResult = await this.soraTopupService.createTopupOrder({
      gameCode: game.code,
      productCode: product.code,
      playerId: cleanPlayerId,
      serverId: cleanServerId || undefined,
      partnerOrderId: createdOrder.orderNumber,
    });

    this.logger.log(`🌸 SoraTopup response for ${createdOrder.orderNumber}: ${providerResult.status}`);

    // 11. Step 3: Handle provider outcome
    if (providerResult.status === 'SUCCESS') {
      await this.prisma.order.update({
        where: { id: createdOrder.id },
        data: {
          status: OrderStatus.SUCCESS,
          providerOrderId: providerResult.providerOrderId,
          providerResponse: {
            ...(providerResult.rawData || {}),
            verified_username: verifiedPlayerName,
          },
        },
      });

      return {
        order_id: createdOrder.orderNumber,
        reseller_order_id: createdOrder.resellerOrderId,
        status: 'SUCCESS',
        game: game.name,
        product: product.name,
        player_id: createdOrder.playerId,
        player_name: verifiedPlayerName,
        server_id: createdOrder.serverId,
        amount: finalAmount.toFixed(2),
        currency: 'USD',
        provider_order_id: providerResult.providerOrderId,
        created_at: createdOrder.createdAt,
      };
    } else if (providerResult.status === 'PENDING') {
      await this.prisma.order.update({
        where: { id: createdOrder.id },
        data: {
          status: OrderStatus.PENDING,
          providerOrderId: providerResult.providerOrderId,
          providerResponse: {
            ...(providerResult.rawData || {}),
            verified_username: verifiedPlayerName,
          },
        },
      });

      return {
        order_id: createdOrder.orderNumber,
        reseller_order_id: createdOrder.resellerOrderId,
        status: 'PENDING',
        game: game.name,
        product: product.name,
        player_id: createdOrder.playerId,
        player_name: verifiedPlayerName,
        server_id: createdOrder.serverId,
        amount: finalAmount.toFixed(2),
        currency: 'USD',
        provider_order_id: providerResult.providerOrderId,
        message: 'Order received and is processing by upstream provider',
        created_at: createdOrder.createdAt,
      };
    } else {
      // FAILED: Execute automatic zero-loss balance refund
      this.logger.warn(`⚠️ SoraTopup failed for ${createdOrder.orderNumber}. Processing refund.`);

      await this.prisma.$transaction(async (tx) => {
        await this.balanceService.refundBalanceForOrder(
          tx,
          resellerId,
          finalAmount,
          createdOrder.id,
          providerResult.message || 'Upstream provider fulfillment failed',
        );

        await tx.order.update({
          where: { id: createdOrder.id },
          data: {
            status: OrderStatus.FAILED,
            failureReason: providerResult.message || 'Upstream provider failure',
            providerResponse: {
              ...(providerResult.rawData || {}),
              verified_username: verifiedPlayerName,
            },
          },
        });
      });

      return {
        order_id: createdOrder.orderNumber,
        reseller_order_id: createdOrder.resellerOrderId,
        status: 'FAILED',
        error: providerResult.message || 'Game top-up fulfillment failed',
        refunded: true,
        amount: finalAmount.toFixed(2),
        currency: 'USD',
        created_at: createdOrder.createdAt,
      };
    }
  }

  /**
   * Sync and verify status of pending orders with SoraTopup
   */
  async syncPendingOrders() {
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
        providerOrderId: { not: null },
      },
      take: 20,
    });

    const results = [];

    for (const order of pendingOrders) {
      if (!order.providerOrderId) continue;

      try {
        const check = await this.soraTopupService.checkOrderStatus(order.providerOrderId);

        if (check.status === 'SUCCESS') {
          await this.prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.SUCCESS },
          });
          results.push({ orderId: order.orderNumber, status: 'SUCCESS' });
        } else if (check.status === 'FAILED') {
          // Refund
          await this.prisma.$transaction(async (tx) => {
            await this.balanceService.refundBalanceForOrder(
              tx,
              order.resellerId,
              order.amount,
              order.id,
              check.message || 'Status sync marked failed',
            );
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: OrderStatus.FAILED,
                failureReason: check.message || 'Failed upon status sync',
              },
            });
          });
          results.push({ orderId: order.orderNumber, status: 'FAILED_REFUNDED' });
        }
      } catch (err: any) {
        this.logger.error(`Error syncing order ${order.orderNumber}: ${err.message}`);
      }
    }

    return {
      syncedCount: results.length,
      details: results,
    };
  }

  async getResellerOrders(resellerId: string, query: OrderQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      resellerId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: 'insensitive' } },
        { resellerOrderId: { contains: s, mode: 'insensitive' } },
        { playerId: { contains: s, mode: 'insensitive' } },
        { game: { name: { contains: s, mode: 'insensitive' } } },
        { product: { name: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          game: {
            select: { id: true, name: true, code: true, iconUrl: true },
          },
          product: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
    ]);

    return {
      items: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        resellerOrderId: o.resellerOrderId,
        game: o.game.name,
        gameCode: o.game.code,
        gameIcon: o.game.iconUrl,
        product: o.product.name,
        productCode: o.product.code,
        playerId: o.playerId,
        serverId: o.serverId,
        amount: o.amount.toString(),
        status: o.status,
        failureReason: o.failureReason,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string, resellerId?: string) {
    const where: Prisma.OrderWhereInput = {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    };

    if (resellerId) {
      where.resellerId = resellerId;
    }

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        game: true,
        product: true,
        reseller: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        transactions: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order '${orderId}' not found`);
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      resellerOrderId: order.resellerOrderId,
      providerOrderId: order.providerOrderId,
      game: {
        id: order.game.id,
        name: order.game.name,
        code: order.game.code,
      },
      product: {
        id: order.product.id,
        name: order.product.name,
        code: order.product.code,
      },
      playerInfo: {
        playerId: order.playerId,
        serverId: order.serverId,
      },
      amount: order.amount.toString(),
      status: order.status,
      failureReason: order.failureReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      transactions: order.transactions.map((tx) => ({
        id: tx.id,
        transactionNumber: tx.transactionNumber,
        amount: tx.amount.toString(),
        type: tx.type,
        status: tx.status,
        createdAt: tx.createdAt,
      })),
    };
  }
}
