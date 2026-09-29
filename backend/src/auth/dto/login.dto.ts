import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'reseller@example.com or @alexander_tg', description: 'User email address or Telegram username' })
  @IsString()
  @IsNotEmpty({ message: 'Email or Telegram username is required' })
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'User password' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
