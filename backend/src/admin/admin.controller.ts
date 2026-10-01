import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadLogoDto } from './dto/upload-logo.dto';
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

  // ==========================================
  // GAME & PRODUCT CATALOG MANAGEMENT
  // ==========================================

  @Get('games')
  @ApiOperation({ summary: 'List all games with their product denominations' })
  @ApiResponse({ status: 200, description: 'Games list with products' })
  async getGames() {
    return this.adminService.getGames();
  }

  @Post('games')
  @ApiOperation({ summary: 'Create a new game in catalog' })
  @ApiResponse({ status: 201, description: 'Game created successfully' })
  async createGame(@Body() dto: CreateGameDto) {
    return this.adminService.createGame(dto);
  }

  @Patch('games/:id')
  @ApiOperation({ summary: 'Update game details or toggle status' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Game updated successfully' })
  async updateGame(@Param('id') id: string, @Body() dto: UpdateGameDto) {
    return this.adminService.updateGame(id, dto);
  }

  @Delete('games/:id')
  @ApiOperation({ summary: 'Delete or deactivate a game' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Game deleted or archived' })
  async deleteGame(@Param('id') id: string) {
    return this.adminService.deleteGame(id);
  }

  @Post('games/upload-logo')
  @ApiOperation({ summary: 'Upload game logo image to VPS storage' })
  @ApiResponse({ status: 201, description: 'Logo uploaded, returns persistent URL' })
  async uploadLogo(@Body() dto: UploadLogoDto) {
    const url = await this.adminService.uploadGameLogo(dto.data, dto.gameCode);
    return { url };
  }

  @Post('games/:id/products')
  @ApiOperation({ summary: 'Add a new product denomination to a game' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 201, description: 'Product created' })
  async createProduct(@Param('id') id: string, @Body() dto: CreateProductDto) {
    return this.adminService.createProduct(id, dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product denomination pricing or status' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete or disable a product denomination' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }
}
