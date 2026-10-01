import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadLogoDto {
  @ApiProperty({ description: 'Base64 encoded image string (e.g. data:image/png;base64,...)' })
  @IsString()
  @IsNotEmpty()
  data: string;

  @ApiPropertyOptional({ example: 'honor-of-kings', description: 'Game code for naming file' })
  @IsOptional()
  @IsString()
  gameCode?: string;
}
