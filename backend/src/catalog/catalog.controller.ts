import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { GameQueryDto } from './dto/game-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Catalog')
@Controller('games')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active game categories' })
  @ApiResponse({ status: 200, description: 'List of games with product count' })
  async getGames(@Query() query: GameQueryDto) {
    return this.catalogService.getGames(query);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get game details by game code' })
  @ApiParam({ name: 'code', example: 'mobile-legends', description: 'Unique game code' })
  @ApiResponse({ status: 200, description: 'Game details' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getGame(@Param('code') code: string) {
    return this.catalogService.getGameByCode(code);
  }

  @Get(':code/products')
  @ApiOperation({ summary: 'Get available products and pricing for a game' })
  @ApiParam({ name: 'code', example: 'mobile-legends', description: 'Unique game code' })
  @ApiResponse({ status: 200, description: 'List of products for the game' })
  async getProducts(
    @Param('code') code: string,
    @Query('resellerId') resellerId?: string,
  ) {
    return this.catalogService.getProductsByGame(code, resellerId);
  }
}
