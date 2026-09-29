import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePricingDto {
  @ApiPropertyOptional({ example: 5.0, description: 'Markup percentage (e.g. 5.0 for 5%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  markupPercentage?: number;

  @ApiPropertyOptional({ example: 0.1, description: 'Fixed dollar markup per item' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedMarkup?: number;
}
