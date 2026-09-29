import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResellerStatus } from '@prisma/client';

export class UpdateResellerStatusDto {
  @ApiProperty({ enum: ResellerStatus, example: ResellerStatus.SUSPENDED })
  @IsEnum(ResellerStatus)
  @IsNotEmpty()
  status: ResellerStatus;
}
