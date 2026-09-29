import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiKeyEnvironment } from '@prisma/client';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'My Production Server', description: 'Friendly name for this key' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ enum: ApiKeyEnvironment, default: ApiKeyEnvironment.LIVE })
  @IsOptional()
  @IsEnum(ApiKeyEnvironment)
  environment?: ApiKeyEnvironment = ApiKeyEnvironment.LIVE;
}
