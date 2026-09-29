import { Controller, Get, Post, Delete, Body, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('API Access')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('api-key')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'Get all API keys for current reseller' })
  @ApiResponse({ status: 200, description: 'List of API keys (prefix only, hashed in DB)' })
  async getKeys(@CurrentUser('resellerId') resellerId: string) {
    if (!resellerId) {
      throw new UnauthorizedException('Only reseller accounts have API keys');
    }
    return this.apiKeysService.getResellerKeys(resellerId);
  }

  @Post()
  @ApiOperation({ summary: 'Generate a new API key' })
  @ApiResponse({ status: 201, description: 'API key generated (Full key returned once)' })
  async createKey(
    @CurrentUser('resellerId') resellerId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    if (!resellerId) {
      throw new UnauthorizedException('Only reseller accounts can generate API keys');
    }
    return this.apiKeysService.createApiKey(resellerId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiParam({ name: 'id', description: 'API Key ID' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  async revokeKey(
    @CurrentUser('resellerId') resellerId: string,
    @Param('id') id: string,
  ) {
    if (!resellerId) {
      throw new UnauthorizedException('Only reseller accounts can manage API keys');
    }
    return this.apiKeysService.revokeKey(resellerId, id);
  }
}
