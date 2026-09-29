import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'Full Name' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: '@alexander_tg', description: 'Telegram Account or Username' })
  @IsString()
  @IsNotEmpty({ message: 'Telegram account (@username) is required' })
  telegram: string;

  @ApiPropertyOptional({ example: 'alexander@gamevault.com', description: 'Reseller email address (optional)' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Sakura Gaming Hub', description: 'Business/Company Name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
