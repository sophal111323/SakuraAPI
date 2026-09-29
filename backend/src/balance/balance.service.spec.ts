import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionType, TransactionStatus } from '@prisma/client';

describe('BalanceService', () => {
  let service: BalanceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      reseller: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      balanceTransaction: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deductBalanceForOrder', () => {
    it('should throw BadRequestException if amount is <= 0', async () => {
      const mockTx: any = {};
      await expect(
        service.deductBalanceForOrder(mockTx, 'res-1', 0, 'ord-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if reseller does not exist', async () => {
      const mockTx: any = {
        reseller: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };

      await expect(
        service.deductBalanceForOrder(mockTx, 'non-existent', 10, 'ord-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if balance is insufficient', async () => {
      const mockTx: any = {
        reseller: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'res-1',
            balance: 5.0,
          }),
        },
      };

      await expect(
        service.deductBalanceForOrder(mockTx, 'res-1', 15.0, 'ord-1'),
      ).rejects.toThrow('Insufficient balance to complete top-up order');
    });

    it('should successfully deduct balance and record transaction', async () => {
      const mockTx: any = {
        reseller: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'res-1',
            balance: 50.0,
          }),
          update: vi.fn().mockResolvedValue({ id: 'res-1', balance: 35.0 }),
        },
        balanceTransaction: {
          create: vi.fn().mockResolvedValue({
            id: 'btx-1',
            type: TransactionType.ORDER_PAYMENT,
            status: TransactionStatus.COMPLETED,
            amount: -15.0,
          }),
        },
      };

      const result = await service.deductBalanceForOrder(mockTx, 'res-1', 15.0, 'ord-1', 'Test payment');
      expect(result.previousBalance).toBe(50.0);
      expect(result.newBalance).toBe(35.0);
      expect(mockTx.reseller.update).toHaveBeenCalledWith({
        where: { id: 'res-1' },
        data: { balance: 35.0 },
      });
    });
  });

  describe('refundBalanceForOrder', () => {
    it('should refund balance and record refund transaction', async () => {
      const mockTx: any = {
        reseller: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'res-1',
            balance: 35.0,
          }),
          update: vi.fn().mockResolvedValue({ id: 'res-1', balance: 50.0 }),
        },
        balanceTransaction: {
          create: vi.fn().mockResolvedValue({
            id: 'btx-ref',
            type: TransactionType.ORDER_REFUND,
            status: TransactionStatus.COMPLETED,
            amount: 15.0,
          }),
        },
      };

      const result = await service.refundBalanceForOrder(mockTx, 'res-1', 15.0, 'ord-1', 'Provider failed');
      expect(result?.previousBalance).toBe(35.0);
      expect(result?.newBalance).toBe(50.0);
      expect(mockTx.reseller.update).toHaveBeenCalledWith({
        where: { id: 'res-1' },
        data: { balance: 50.0 },
      });
    });
  });

  describe('adjustBalance', () => {
    it('should reject debit that results in negative balance', async () => {
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          reseller: {
            findUnique: vi.fn().mockResolvedValue({ id: 'res-1', balance: 10.0 }),
          },
        };
        return callback(tx);
      });

      await expect(
        service.adjustBalance('res-1', -20.0, 'admin-1', TransactionType.ADMIN_DEBIT, 'Correction'),
      ).rejects.toThrow('Balance cannot be negative');
    });
  });
});
