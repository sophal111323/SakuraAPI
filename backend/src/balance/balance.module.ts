import { Module, Global } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';

@Global()
@Module({
  controllers: [BalanceController],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
