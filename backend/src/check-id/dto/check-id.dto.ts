import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckIdDto {
  @ApiProperty({
    example: 'mobile-legends',
    description: 'Game code (e.g. mobile-legends, mlbb, free-fire, genshin-impact)',
  })
  @IsNotEmpty({ message: 'game code is required' })
  @IsString()
  game: string;

  @ApiProperty({
    example: '12345678',
    description: 'User ID / Player ID in the game',
  })
  @IsNotEmpty({ message: 'userid is required' })
  @IsString()
  userid: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Zone ID / Server ID (required for MLBB, Genshin, etc.)',
  })
  @IsOptional()
  @IsString()
  serverid?: string;
}

export class CheckIdQueryDto {
  @ApiProperty({
    example: 'mobile-legends',
    description: 'Game code (e.g. mobile-legends, mlbb, free-fire, genshin-impact)',
  })
  @IsNotEmpty({ message: 'game code is required' })
  @IsString()
  game: string;

  @ApiProperty({
    example: '12345678',
    description: 'User ID / Player ID in the game',
  })
  @IsNotEmpty({ message: 'userid is required' })
  @IsString()
  userid: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Zone ID / Server ID (required for MLBB, Genshin, etc.)',
  })
  @IsOptional()
  @IsString()
  serverid?: string;
}
