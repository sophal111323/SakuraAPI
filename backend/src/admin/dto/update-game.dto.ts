import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GameStatus } from '@prisma/client';

export class UpdateGameDto {
  @ApiPropertyOptional({ example: 'Honor of Kings Global' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'MOBA' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'https://sakuraapi.lol/api/v1/avatar/games/hok.png' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  requiresServerId?: boolean;

  @ApiPropertyOptional({ example: 'Zone ID' })
  @IsOptional()
  @IsString()
  serverIdLabel?: string;

  @ApiPropertyOptional({ example: 'Player ID' })
  @IsOptional()
  @IsString()
  playerIdLabel?: string;

  @ApiPropertyOptional({ enum: GameStatus, example: GameStatus.ACTIVE })
  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;
}
