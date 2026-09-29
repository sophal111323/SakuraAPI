import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GameQueryDto {
  @ApiPropertyOptional({ description: 'Filter games by category or genre' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Search game name or code' })
  @IsOptional()
  @IsString()
  search?: string;
}
