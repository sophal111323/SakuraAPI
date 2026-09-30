import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckDepositDto {
  @ApiProperty({ example: 'DEP-1790747836029', description: 'Transaction ID returned from create-khqr' })
  @IsString()
  @IsNotEmpty({ message: 'Transaction ID is required' })
  tran_id: string;
}
