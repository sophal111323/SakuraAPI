import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'mobile-legends', description: 'Unique Game Code identifier' })
  @IsString()
  @IsNotEmpty({ message: 'Game code is required' })
  game: string;

  @ApiProperty({ example: 'mlbb-86', description: 'Product denomination code' })
  @IsString()
  @IsNotEmpty({ message: 'Product code is required' })
  product: string;

  @ApiProperty({ example: '12345678', description: 'Player User ID or UID' })
  @IsString()
  @IsNotEmpty({ message: 'Player ID is required' })
  player_id: string;

  @ApiPropertyOptional({ example: '1234', description: 'Game Server ID / Zone ID (only for games that require it)' })
  @IsOptional()
  @IsString()
  server_id?: string;

  @ApiPropertyOptional({ example: 'ORDER-100234', description: 'Reseller internal order ID for idempotency' })
  @IsOptional()
  @IsString()
  reseller_order_id?: string;
}
