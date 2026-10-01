import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameStatus } from '@prisma/client';

export class CreateGameDto {
  @ApiProperty({ example: 'honor-of-kings', description: 'Unique Game identifier code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Honor of Kings', description: 'Display name of the game' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'MOBA', description: 'Category of game' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'https://sakuraapi.lol/api/v1/avatar/games/hok.png', description: 'Game Logo URL' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether this game requires server / zone ID' })
  @IsOptional()
  @IsBoolean()
  requiresServerId?: boolean;

  @ApiPropertyOptional({ example: 'Server ID / Zone ID', description: 'Label for server ID field' })
  @IsOptional()
  @IsString()
  serverIdLabel?: string;

  @ApiPropertyOptional({ example: 'Player ID / UID', description: 'Label for player ID field' })
  @IsOptional()
  @IsString()
  playerIdLabel?: string;

  @ApiPropertyOptional({ enum: GameStatus, example: GameStatus.ACTIVE })
  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;
}
