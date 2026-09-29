import { Controller, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResellerService } from './reseller.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reseller Dashboard')
@Controller('reseller')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('api-key')
export class ResellerController {
  constructor(private readonly resellerService: ResellerService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get live real-time reseller dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Live balance, order counts, spent amounts, and API counts' })
  async getDashboard(@CurrentUser('resellerId') resellerId: string) {
    if (!resellerId) {
      throw new UnauthorizedException('Only reseller accounts have access to reseller dashboard');
    }
    return this.resellerService.getDashboardMetrics(resellerId);
  }
}
