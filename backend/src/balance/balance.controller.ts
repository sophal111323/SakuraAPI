import { Controller, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResellerApiGuard } from '../auth/guards/reseller-api.guard';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Public Reseller API')
@Controller('balance')
@UseGuards(ResellerApiGuard, RateLimitGuard)
@ApiBearerAuth('api-key')
export class BalanceController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get current reseller wallet balance via API Key' })
  @ApiResponse({ status: 200, description: 'Reseller current balance' })
  async getBalance(@CurrentUser('resellerId') resellerId: string) {
    if (!resellerId) {
      throw new UnauthorizedException('Authentication required');
    }

    const reseller = await this.prisma.reseller.findUnique({
      where: { id: resellerId },
      select: {
        balance: true,
        currency: true,
        companyName: true,
        pricingTier: true,
        updatedAt: true,
      },
    });

    if (!reseller) {
      throw new UnauthorizedException('Reseller profile not found');
    }

    return {
      balance: reseller.balance.toString(),
      currency: reseller.currency,
      company_name: reseller.companyName,
      pricing_tier: reseller.pricingTier,
      updated_at: reseller.updatedAt,
    };
  }
}
