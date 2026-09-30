import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResellerService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(resellerId: string) {
    const reseller = await this.prisma.reseller.findUnique({
      where: { id: resellerId },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!reseller) {
      throw new NotFoundException('Reseller profile not found');
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      totalSpentAgg,
      todayOrders,
      todaySpentAgg,
      successfulOrders,
      failedOrders,
      pendingOrders,
      totalApiRequests,
      recentOrders,
      activeKeysCount,
    ] = await Promise.all([
      this.prisma.order.count({ where: { resellerId } }),
      this.prisma.order.aggregate({
        where: { resellerId, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.order.count({
        where: { resellerId, createdAt: { gte: startOfToday } },
      }),
      this.prisma.order.aggregate({
        where: { resellerId, status: 'SUCCESS', createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      this.prisma.order.count({ where: { resellerId, status: 'SUCCESS' } }),
      this.prisma.order.count({ where: { resellerId, status: 'FAILED' } }),
      this.prisma.order.count({
        where: { resellerId, status: { in: ['PENDING', 'PROCESSING'] } },
      }),
      this.prisma.apiRequestLog.count({
        where: { resellerId, apiKeyId: { not: null } },
      }),
      this.prisma.order.findMany({
        where: { resellerId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          game: { select: { name: true, code: true } },
          product: { select: { name: true } },
        },
      }),
      this.prisma.apiKey.count({
        where: { resellerId, status: 'ACTIVE' },
      }),
    ]);

    return {
      balance: reseller.balance.toString(),
      currency: reseller.currency,
      companyName: reseller.companyName,
      metrics: {
        totalOrders,
        totalSpent: (totalSpentAgg._sum.amount || 0).toString(),
        todayOrders,
        todaySpent: (todaySpentAgg._sum.amount || 0).toString(),
        successfulOrders,
        failedOrders,
        pendingOrders,
        totalApiRequests,
        activeKeysCount,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        game: o.game.name,
        product: o.product.name,
        playerId: o.playerId,
        amount: o.amount.toString(),
        status: o.status,
        createdAt: o.createdAt,
      })),
    };
  }
}
