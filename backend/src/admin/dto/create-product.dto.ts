import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'hok-80', description: 'Product code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '80 Tokens', description: 'Denomination display name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1.25, description: 'Default reseller price (USD)' })
  @IsNumber()
  @IsNotEmpty()
  resellerPrice: number;

  @ApiPropertyOptional({ example: 1.0, description: 'Provider cost price (USD)' })
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
