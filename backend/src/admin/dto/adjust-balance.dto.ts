import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class AdjustBalanceDto {
  @ApiProperty({ example: 'uuid-reseller-id', description: 'Target Reseller ID' })
  @IsString()
  @IsNotEmpty()
  resellerId: string;

  @ApiProperty({ example: 50.0, description: 'Amount to credit or debit' })
  @IsNumber()
  @IsPositive({ message: 'Adjustment amount must be positive' })
  amount: number;

  @ApiProperty({
    enum: [TransactionType.ADMIN_CREDIT, TransactionType.ADMIN_DEBIT, TransactionType.MANUAL_ADJUSTMENT],
    example: TransactionType.ADMIN_CREDIT,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'Promotional deposit bonus', description: 'Mandatory reason for audit log' })
  @IsString()
  @IsNotEmpty({ message: 'A note or reason is required for balance adjustments' })
  note: string;
}
