import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ResellerQueryDto } from './dto/reseller-query.dto';
import { UpdateResellerStatusDto } from './dto/update-status.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { LogsQueryDto } from './dto/logs-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Panel')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('api-key')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get complete platform-wide admin statistics and KPIs' })
  @ApiResponse({ status: 200, description: 'Platform KPIs, financial overview, and recent activity' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('resellers')
  @ApiOperation({ summary: 'List and search all reseller accounts' })
  @ApiResponse({ status: 200, description: 'Paginated resellers list' })
  async getResellers(@Query() query: ResellerQueryDto) {
    return this.adminService.getResellers(query);
  }

  @Get('resellers/:id')
  @ApiOperation({ summary: 'Get full reseller detail, order metrics, and transaction history' })
  @ApiParam({ name: 'id', description: 'Reseller ID' })
  @ApiResponse({ status: 200, description: 'Detailed reseller profile' })
  async getResellerDetail(@Param('id') id: string) {
    return this.adminService.getResellerDetail(id);
  }

  @Patch('resellers/:id/status')
  @ApiOperation({ summary: 'Activate or suspend a reseller account' })
  @ApiParam({ name: 'id', description: 'Reseller ID' })
  @ApiResponse({ status: 200, description: 'Reseller status updated and audit logged' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateResellerStatusDto,
    @CurrentUser('id') adminId: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.adminService.updateResellerStatus(id, dto.status, adminId, ip);
  }

  @Patch('resellers/:id/pricing')
  @ApiOperation({ summary: 'Configure markup percentage or fixed markup for reseller' })
  @ApiParam({ name: 'id', description: 'Reseller ID' })
  @ApiResponse({ status: 200, description: 'Pricing rules updated' })
  async updatePricing(
    @Param('id') id: string,
    @Body() dto: UpdatePricingDto,
    @CurrentUser('id') adminId: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.adminService.updateResellerPricing(id, dto, adminId, ip);
  }

  @Post('balance/adjust')
  @ApiOperation({ summary: 'Manually credit, debit, or adjust a reseller balance with audit logging' })
  @ApiResponse({ status: 200, description: 'Balance updated atomically with transaction record' })
  async adjustBalance(
    @Body() dto: AdjustBalanceDto,
    @CurrentUser('id') adminId: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.adminService.adjustBalance(dto, adminId, ip);
  }

  @Get('logs')
  @ApiOperation({ summary: 'View API request audit logs with latency and status filtering' })
  @ApiResponse({ status: 200, description: 'Paginated API request logs' })
  async getLogs(@Query() query: LogsQueryDto) {
    return this.adminService.getApiLogs(query);
  }
}
