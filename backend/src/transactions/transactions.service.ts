import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getResellerTransactions(
    resellerId: string,
    options?: { type?: TransactionType; page?: number; limit?: number },
  ) {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 15));
    const skip = (page - 1) * limit;

    const where: any = { resellerId };
    if (options?.type) {
      where.type = options.type;
    }

    const [total, items] = await Promise.all([
      this.prisma.balanceTransaction.count({ where }),
      this.prisma.balanceTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: items.map((tx) => ({
        id: tx.id,
        transactionNumber: tx.transactionNumber,
        amount: tx.amount.toString(),
        previousBalance: tx.previousBalance.toString(),
        newBalance: tx.newBalance.toString(),
        type: tx.type,
        status: tx.status,
        note: tx.note,
        createdAt: tx.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
