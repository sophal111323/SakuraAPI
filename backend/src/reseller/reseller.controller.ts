import { Controller, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResellerService } from './reseller.service';
import { ResellerApiGuard } from '../auth/guards/reseller-api.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reseller')
@Controller('reseller')
@UseGuards(ResellerApiGuard)
@ApiBearerAuth('api-key')
export class ResellerController {
  constructor(private readonly resellerService: ResellerService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current reseller profile information and balance' })
  @ApiResponse({ status: 200, description: 'Profile details, wallet balance, and order stats' })
  async getProfile(@CurrentUser('resellerId') resellerId: string) {
    if (!resellerId) {
      throw new UnauthorizedException('Reseller account required');
    }
    return this.resellerService.getResellerProfile(resellerId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Alias for /reseller/me' })
  async getProfileAlias(@CurrentUser('resellerId') resellerId: string) {
    if (!resellerId) {
      throw new UnauthorizedException('Reseller account required');
    }
    return this.resellerService.getResellerProfile(resellerId);
  }

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
