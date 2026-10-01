import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: '80 Tokens' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 1.25 })
  @IsOptional()
  @IsNumber()
  resellerPrice?: number;

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional()
  @IsNumber()
  providerPrice?: number;

  @ApiPropertyOptional({ example: 'provider_item_123' })
  @IsOptional()
  @IsString()
  providerProductId?: string;

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
