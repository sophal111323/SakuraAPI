import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDepositDto {
  @ApiProperty({ example: 5.0, description: 'Deposit amount in USD (minimum $0.10)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.1, { message: 'Minimum deposit amount is $0.10' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;
}
