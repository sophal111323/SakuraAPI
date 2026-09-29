import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderQueryDto } from './dto/order-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ResellerApiGuard } from '../auth/guards/reseller-api.guard';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(ResellerApiGuard, RateLimitGuard)
@ApiBearerAuth('api-key')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create automated game top-up order via API key or session' })
  @ApiResponse({ status: 201, description: 'Order created and processed with SoraTopup' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid player/server' })
  @ApiResponse({ status: 402, description: 'Insufficient reseller balance' })
  @ApiResponse({ status: 409, description: 'Duplicate reseller_order_id' })
  async createOrder(
    @CurrentUser('resellerId') resellerId: string,
    @Body() dto: CreateOrderDto,
    @Req() req: any,
  ) {
    if (!resellerId) {
      throw new UnauthorizedException('Only reseller accounts can place orders');
    }
    const ip = req.ip || req.connection?.remoteAddress;
    return this.ordersService.createOrder(resellerId, dto, ip);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Synchronize status of pending orders with SoraTopup' })
  @ApiResponse({ status: 200, description: 'Pending orders checked and updated' })
  async syncOrders() {
    return this.ordersService.syncPendingOrders();
  }

  @Get()
  @ApiOperation({ summary: 'Get order history for authenticated reseller' })
  @ApiResponse({ status: 200, description: 'Paginated orders list' })
  async getOrders(
    @CurrentUser('resellerId') resellerId: string,
    @Query() query: OrderQueryDto,
  ) {
    if (!resellerId) {
      throw new UnauthorizedException('Only reseller accounts have order history');
    }
    return this.ordersService.getResellerOrders(resellerId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID or Order Number' })
  @ApiParam({ name: 'id', description: 'Order ID or Order Number (e.g. SK-2026-0001)' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(
    @CurrentUser('resellerId') resellerId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
  ) {
    const scopedResellerId = role === 'ADMIN' ? undefined : resellerId;
    return this.ordersService.getOrderById(id, scopedResellerId);
  }
}
