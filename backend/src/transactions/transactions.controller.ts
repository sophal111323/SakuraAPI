import { Controller, Get, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransactionType } from '@prisma/client';

@ApiTags('Funding & Balance')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('api-key')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get funding and balance transaction history for reseller' })
  @ApiQuery({ name: 'type', enum: TransactionType, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated transactions list' })
  async getTransactions(
    @CurrentUser('resellerId') resellerId: string,
    @Query('type') type?: TransactionType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!resellerId) {
      throw new UnauthorizedException('Only reseller accounts have transactions');
    }
    return this.transactionsService.getResellerTransactions(resellerId, {
      type,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 15,
    });
  }
}
