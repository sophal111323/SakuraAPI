import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class BalanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Atomically deducts reseller balance within an existing transaction
   */
  async deductBalanceForOrder(
    tx: Prisma.TransactionClient,
    resellerId: string,
    amount: number | Prisma.Decimal,
    orderId: string,
    note?: string,
  ) {
    const numAmount = typeof amount === 'number' ? amount : Number(amount);
    if (numAmount <= 0) {
      throw new BadRequestException('Deduction amount must be positive');
    }

    const reseller = await tx.reseller.findUnique({
      where: { id: resellerId },
    });

    if (!reseller) {
      throw new NotFoundException('Reseller profile not found');
    }

    const currentBal = Number(reseller.balance);
    if (currentBal < numAmount) {
      throw new BadRequestException('Insufficient balance to complete top-up order');
    }

    const newBal = Number((currentBal - numAmount).toFixed(4));
    const txNumber = `TX-DED-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update balance
    await tx.reseller.update({
      where: { id: resellerId },
      data: { balance: newBal },
    });

    // Create immutable audit transaction record
    const balanceTx = await tx.balanceTransaction.create({
      data: {
        transactionNumber: txNumber,
        resellerId,
        amount: -numAmount,
        previousBalance: currentBal,
        newBalance: newBal,
        type: TransactionType.ORDER_PAYMENT,
        status: TransactionStatus.COMPLETED,
        orderId,
        note: note || `Payment for order ${orderId}`,
      },
    });

    return {
      previousBalance: currentBal,
      newBalance: newBal,
      balanceTransaction: balanceTx,
    };
  }

  /**
   * Atomically refunds balance for a failed order within an existing transaction
   */
  async refundBalanceForOrder(
    tx: Prisma.TransactionClient,
    resellerId: string,
    amount: number | Prisma.Decimal,
    orderId: string,
    reason: string,
  ) {
    const numAmount = typeof amount === 'number' ? amount : Number(amount);
    if (numAmount <= 0) {
      return null;
    }

    const reseller = await tx.reseller.findUnique({
      where: { id: resellerId },
    });

    if (!reseller) {
      throw new NotFoundException('Reseller profile not found');
    }

    const currentBal = Number(reseller.balance);
    const newBal = Number((currentBal + numAmount).toFixed(4));
    const txNumber = `TX-REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await tx.reseller.update({
      where: { id: resellerId },
      data: { balance: newBal },
    });

    const balanceTx = await tx.balanceTransaction.create({
      data: {
        transactionNumber: txNumber,
        resellerId,
        amount: numAmount,
        previousBalance: currentBal,
        newBalance: newBal,
        type: TransactionType.ORDER_REFUND,
        status: TransactionStatus.COMPLETED,
        orderId,
        note: `Automatic order refund: ${reason}`,
      },
    });

    return {
      previousBalance: currentBal,
      newBalance: newBal,
      balanceTransaction: balanceTx,
    };
  }

  /**
   * Admin manual credit/debit adjustment
   */
  async adjustBalance(
    resellerId: string,
    amount: number,
    adminId: string,
    type: TransactionType,
    note: string,
  ) {
    if (amount === 0) {
      throw new BadRequestException('Amount cannot be zero');
    }

    return this.prisma.$transaction(async (tx) => {
      const reseller = await tx.reseller.findUnique({
        where: { id: resellerId },
      });

      if (!reseller) {
        throw new NotFoundException('Reseller profile not found');
      }

      const currentBal = Number(reseller.balance);
      const newBal = Number((currentBal + amount).toFixed(4));

      if (newBal < 0) {
        throw new BadRequestException('Balance cannot be negative');
      }

      const txNumber = `TX-ADJ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await tx.reseller.update({
        where: { id: resellerId },
        data: { balance: newBal },
      });

      const record = await tx.balanceTransaction.create({
        data: {
          transactionNumber: txNumber,
          resellerId,
          amount,
          previousBalance: currentBal,
          newBalance: newBal,
          type,
          status: TransactionStatus.COMPLETED,
          adminId,
          note,
        },
      });

      return {
        resellerId,
        previousBalance: currentBal,
        newBalance: newBal,
        transaction: record,
      };
    });
  }
}
