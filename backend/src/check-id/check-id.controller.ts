import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Bay2GameService } from '../provider/bay2game.service';
import { CheckIdDto, CheckIdQueryDto } from './dto/check-id.dto';
import { ResellerApiGuard } from '../auth/guards/reseller-api.guard';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';

@ApiTags('Game ID Validation')
@Controller()
@UseGuards(ResellerApiGuard, RateLimitGuard)
@ApiBearerAuth('api-key')
export class CheckIdController {
  constructor(private readonly bay2gameService: Bay2GameService) {}

  @Post(['games/check-id', 'check-id'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate Game Player ID and retrieve in-game username (POST)',
    description:
      'Downstream resellers call this endpoint using their SakuraAPI key to verify player IDs before top-up fulfillment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Game Player ID verification outcome',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing SakuraAPI Key',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded (100 req/min)',
  })
  async checkIdPost(@Body() dto: CheckIdDto) {
    return this.bay2gameService.checkId(dto.game, dto.userid, dto.serverid);
  }

  @Get(['games/check-id', 'check-id'])
  @ApiOperation({
    summary: 'Validate Game Player ID and retrieve in-game username (GET)',
    description:
      'Query parameter alternative for validating player usernames via SakuraAPI Bearer token.',
  })
  @ApiQuery({ name: 'game', example: 'mobile-legends', required: true })
  @ApiQuery({ name: 'userid', example: '12345678', required: true })
  @ApiQuery({ name: 'serverid', example: '1234', required: false })
  @ApiResponse({
    status: 200,
    description: 'Game Player ID verification outcome',
  })
  async checkIdGet(@Query() query: CheckIdQueryDto) {
    return this.bay2gameService.checkId(query.game, query.userid, query.serverid);
  }

  @Get(['games/check-id/categories', 'check-id/categories'])
  @ApiOperation({
    summary: 'Get all games supported for ID verification and their required fields',
    description:
      'Fetches the complete catalog of games supported by the upstream ID validator with required input fields (userid, serverid).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of games supported for ID verification',
  })
  async getCategories() {
    const categories = await this.bay2gameService.getCategories();
    return {
      total: categories.length,
      categories,
    };
  }
}
