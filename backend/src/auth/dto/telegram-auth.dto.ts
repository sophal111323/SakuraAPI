import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TelegramAuthDto {
  @ApiProperty({ example: 123456789, description: 'Telegram User ID' })
  @IsNotEmpty()
  id: number | string;

  @ApiProperty({ example: 'Alexander', description: 'First name from Telegram' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiPropertyOptional({ example: 'Wright', description: 'Last name from Telegram' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ example: 'alexander_tg', description: 'Telegram @username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'https://t.me/i/userpic/320/photo.jpg', description: 'Avatar photo URL' })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiProperty({ example: 1699999999, description: 'Authentication timestamp from Telegram' })
  @IsNotEmpty()
  auth_date: number | string;

  @ApiProperty({ example: 'd28a3...', description: 'HMAC-SHA256 signature calculated with bot token' })
  @IsString()
  @IsNotEmpty()
  hash: string;
}
