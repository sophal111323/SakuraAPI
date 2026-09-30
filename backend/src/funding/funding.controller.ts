import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FundingService } from './funding.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CheckDepositDto } from './dto/check-deposit.dto';

@ApiTags('Funding & Balance Deposit')
@Controller('funding')
export class FundingController {
  constructor(private readonly fundingService: FundingService) {}

  @Post('create-khqr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create PayWay KHQR transaction for wallet deposit' })
  @ApiResponse({ status: 201, description: 'KHQR transaction details' })
  async createKhqr(
    @CurrentUser('resellerId') resellerId: string,
    @Body() dto: CreateDepositDto,
  ) {
    if (!resellerId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.fundingService.createKhqrDeposit(resellerId, dto.amount);
  }

  @Post('check-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check PayWay payment status and credit balance if approved' })
  @ApiResponse({ status: 200, description: 'Payment verification status' })
  async checkStatus(
    @CurrentUser('resellerId') resellerId: string,
    @Body() dto: CheckDepositDto,
  ) {
    return this.fundingService.checkDepositStatus(dto.tran_id, resellerId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayWay webhook callback endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook acknowledged' })
  async handleWebhook(@Body() body: any) {
    return this.fundingService.handleWebhook(body);
  }
}
