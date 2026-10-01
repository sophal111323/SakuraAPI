import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { SoraTopupService } from '../provider/soratopup.service';
import { Bay2GameService } from '../provider/bay2game.service';
import { BalanceService } from '../balance/balance.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;
  let soraTopupService: any;
  let balanceService: any;
  let bay2gameService: any;

  beforeEach(async () => {
    const gameMock = vi.fn();
    prisma = {
      game: {
        findUnique: gameMock,
        findFirst: gameMock,
      },
      product: {
        findFirst: vi.fn(),
      },
      reseller: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'res-1',
          status: 'ACTIVE',
          balance: '100.0',
          currency: 'USD',
          markupPercentage: 0,
          fixedMarkup: 0,
        }),
      },
      order: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    soraTopupService = {
      createTopupOrder: vi.fn(),
      checkOrderStatus: vi.fn(),
    };

    balanceService = {
      deductBalanceForOrder: vi.fn(),
      refundBalanceForOrder: vi.fn(),
    };

    bay2gameService = {
      checkId: vi.fn().mockResolvedValue({ valid: true, username: 'PlayerOne' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: SoraTopupService, useValue: soraTopupService },
        { provide: BalanceService, useValue: balanceService },
        { provide: Bay2GameService, useValue: bay2gameService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder validation', () => {
    it('should throw BadRequestException if game is invalid or inactive', async () => {
      prisma.game.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrder('res-1', {
          game: 'unknown-game',
          product: 'prod-1',
          player_id: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if game requires serverId but none provided', async () => {
      prisma.game.findUnique.mockResolvedValue({
        id: 'game-1',
        name: 'Mobile Legends',
        code: 'mobile-legends',
        status: 'ACTIVE',
        requiresServerId: true,
        serverIdLabel: 'Zone ID',
      });

      await expect(
        service.createOrder('res-1', {
          game: 'mobile-legends',
          product: 'prod-1',
          player_id: '123456',
        }),
      ).rejects.toThrow(/requires 'Zone ID'/);
    });

    it('should throw BadRequestException if product is invalid or unavailable', async () => {
      prisma.game.findUnique.mockResolvedValue({
        id: 'game-1',
        name: 'Free Fire',
        code: 'free-fire',
        status: 'ACTIVE',
        requiresServerId: false,
      });

      prisma.product.findFirst.mockResolvedValue(null);

      await expect(
        service.createOrder('res-1', {
          game: 'free-fire',
          product: 'invalid-prod',
          player_id: '123456',
        }),
      ).rejects.toThrow(/invalid or out of stock/);
    });

    it('should throw ConflictException on duplicate reseller_order_id', async () => {
      prisma.game.findUnique.mockResolvedValue({
        id: 'game-1',
        name: 'Free Fire',
        code: 'free-fire',
        status: 'ACTIVE',
        requiresServerId: false,
      });

      prisma.product.findFirst.mockResolvedValue({
        id: 'p-1',
        code: 'ff-100',
        name: '100 Diamonds',
        status: 'AVAILABLE',
        resellerPrice: 1.5,
        providerPrice: 1.2,
      });

      prisma.order.findUnique.mockResolvedValue({
        id: 'existing-order',
        orderNumber: 'SK-20260929-123456',
      });

      await expect(
        service.createOrder('res-1', {
          game: 'free-fire',
          product: 'ff-100',
          player_id: '123456',
          reseller_order_id: 'DUPLICATE-REF-123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if reseller balance is insufficient', async () => {
      prisma.game.findUnique.mockResolvedValue({
        id: 'game-1',
        name: 'Free Fire',
        code: 'free-fire',
        status: 'ACTIVE',
        requiresServerId: false,
      });

      prisma.product.findFirst.mockResolvedValue({
        id: 'p-1',
        code: 'ff-100',
        name: '100 Diamonds',
        status: 'AVAILABLE',
        resellerPrice: 15.0,
        providerPrice: 12.0,
      });

      prisma.reseller.findUnique.mockResolvedValue({
        id: 'res-1',
        status: 'ACTIVE',
        balance: '5.0', // Only $5.00 available, but product is $15.00
        currency: 'USD',
        markupPercentage: 0,
        fixedMarkup: 0,
      });

      await expect(
        service.createOrder('res-1', {
          game: 'free-fire',
          product: 'ff-100',
          player_id: '123456',
        }),
      ).rejects.toThrow(/Insufficient balance/);
    });

    it('should throw BadRequestException if player ID is confirmed not found by validator', async () => {
      prisma.game.findUnique.mockResolvedValue({
        id: 'game-1',
        name: 'Free Fire',
        code: 'free-fire',
        status: 'ACTIVE',
        requiresServerId: false,
      });

      prisma.product.findFirst.mockResolvedValue({
        id: 'p-1',
        code: 'ff-100',
        name: '100 Diamonds',
        status: 'AVAILABLE',
        resellerPrice: 1.0,
        providerPrice: 0.8,
      });

      prisma.reseller.findUnique.mockResolvedValue({
        id: 'res-1',
        status: 'ACTIVE',
        balance: '50.0',
        currency: 'USD',
        markupPercentage: 0,
        fixedMarkup: 0,
      });

      // Mock checkId to report invalid / non-existent user
      bay2gameService.checkId.mockResolvedValue({
        valid: false,
        username: null,
        message: 'User not found on server.',
      });

      await expect(
        service.createOrder('res-1', {
          game: 'free-fire',
          product: 'ff-100',
          player_id: '999999999',
        }),
      ).rejects.toThrow(/was verified as INVALID or NOT FOUND/);
    });
  });

  describe('createOrder execution & auto-refund', () => {
    it('should fulfill order when SoraTopup responds with SUCCESS', async () => {
      prisma.game.findUnique.mockResolvedValue({
        id: 'game-1',
        name: 'Free Fire',
        code: 'free-fire',
        status: 'ACTIVE',
        requiresServerId: false,
      });

      prisma.product.findFirst.mockResolvedValue({
        id: 'p-1',
        code: 'ff-100',
        name: '100 Diamonds',
        status: 'AVAILABLE',
        resellerPrice: 1.5,
        providerPrice: 1.2,
      });

      prisma.order.findUnique.mockResolvedValue(null);

      prisma.reseller.findUnique.mockResolvedValue({
        id: 'res-1',
        status: 'ACTIVE',
        markupPercentage: 0,
        fixedMarkup: 0,
      });

      const fakePendingOrder = {
        id: 'order-uuid-1',
        orderNumber: 'SK-20260929-999999',
        resellerOrderId: 'REF-001',
        playerId: '123456',
        serverId: null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
      };

      prisma.$transaction.mockResolvedValue(fakePendingOrder);

      soraTopupService.createTopupOrder.mockResolvedValue({
        status: 'SUCCESS',
        providerOrderId: 'SORA-TX-888',
        rawData: { code: 200 },
      });

      prisma.order.update.mockResolvedValue({
        ...fakePendingOrder,
        status: OrderStatus.SUCCESS,
        providerOrderId: 'SORA-TX-888',
      });

      const response = await service.createOrder('res-1', {
        game: 'free-fire',
        product: 'ff-100',
        player_id: '123456',
        reseller_order_id: 'REF-001',
      });

      expect(response.status).toBe('SUCCESS');
      expect(response.provider_order_id).toBe('SORA-TX-888');
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: OrderStatus.SUCCESS }),
        }),
      );
    });

    it('should trigger zero-loss balance refund when SoraTopup fails', async () => {
      prisma.game.findUnique.mockResolvedValue({
        id: 'game-1',
        name: 'Free Fire',
        code: 'free-fire',
        status: 'ACTIVE',
        requiresServerId: false,
      });

      prisma.product.findFirst.mockResolvedValue({
        id: 'p-1',
        code: 'ff-100',
        name: '100 Diamonds',
        status: 'AVAILABLE',
        resellerPrice: 1.5,
        providerPrice: 1.2,
      });

      prisma.order.findUnique.mockResolvedValue(null);

      prisma.reseller.findUnique.mockResolvedValue({
        id: 'res-1',
        status: 'ACTIVE',
        markupPercentage: 0,
        fixedMarkup: 0,
      });

      const fakePendingOrder = {
        id: 'order-uuid-fail',
        orderNumber: 'SK-20260929-888888',
        resellerOrderId: 'REF-FAIL',
        playerId: '123456',
        serverId: null,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
      };

      // Mock first transaction (order creation)
      prisma.$transaction.mockImplementationOnce(async () => fakePendingOrder);

      // Upstream fails
      soraTopupService.createTopupOrder.mockResolvedValue({
        status: 'FAILED',
        message: 'Invalid Player ID',
      });

      // Mock second transaction (refund + order status update)
      prisma.$transaction.mockImplementationOnce(async (callback: any) => {
        const tx = {
          order: {
            update: vi.fn(),
          },
        };
        return callback(tx);
      });

      const response = await service.createOrder('res-1', {
        game: 'free-fire',
        product: 'ff-100',
        player_id: '123456',
        reseller_order_id: 'REF-FAIL',
      });

      expect(response.status).toBe('FAILED');
      expect(response.refunded).toBe(true);
      expect(balanceService.refundBalanceForOrder).toHaveBeenCalled();
    });
  });
});
