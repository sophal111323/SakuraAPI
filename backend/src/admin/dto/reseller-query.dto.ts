import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ResellerStatus } from '@prisma/client';

export class ResellerQueryDto {
  @ApiPropertyOptional({ enum: ResellerStatus })
  @IsOptional()
  @IsEnum(ResellerStatus)
  status?: ResellerStatus;

  @ApiPropertyOptional({ description: 'Search reseller name, email, or company' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 15;
}
