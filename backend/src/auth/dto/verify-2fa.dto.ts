import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2faDto {
  @ApiProperty({ description: 'Temporary 2FA session token returned from login' })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({ description: '6-digit OTP code or 256-character secret key received on Telegram' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class Resend2faDto {
  @ApiProperty({ description: 'Temporary 2FA session token' })
  @IsString()
  @IsNotEmpty()
  tempToken: string;
}
