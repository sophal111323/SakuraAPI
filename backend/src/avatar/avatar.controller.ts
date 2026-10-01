import { Controller, Get, Param, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AvatarService } from './avatar.service';

@ApiTags('Avatars')
@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Get('games/:filename')
  @ApiOperation({ summary: 'Get game logo uploaded on VPS' })
  getGameLogo(@Param('filename') filename: string, @Res() res: Response) {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.resolve(process.cwd(), 'uploads', 'games', path.basename(filename));
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=604800');
      return res.sendFile(filePath);
    }
    return res.status(HttpStatus.NOT_FOUND).send('Logo not found');
  }

  @Get(':username')
  @ApiOperation({
    summary: "Get reseller's Telegram profile avatar (stored on VPS)",
    description:
      'Fetches, stores on the VPS disk, and serves the Telegram profile image for the given username. Returns an SVG avatar fallback if unavailable.',
  })
  @ApiParam({ name: 'username', example: 'Thephal', description: 'Telegram username (with or without @)' })
  @ApiQuery({ name: 'refresh', required: false, type: Boolean, description: 'Force re-download from Telegram' })
  @ApiResponse({ status: 200, description: 'Image file or SVG' })
  async getAvatar(
    @Param('username') username: string,
    @Query('refresh') refresh: string,
    @Res() res: Response,
  ) {
    const forceRefresh = refresh === 'true' || refresh === '1';
    const result = await this.avatarService.getOrFetchAvatar(username, forceRefresh);

    if (result.filePath) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      return res.sendFile(result.filePath);
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(HttpStatus.OK).send(result.svg);
  }
}
