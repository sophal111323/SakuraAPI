import { Module, Global } from '@nestjs/common';
import { SoraTopupService } from './soratopup.service';
import { Bay2GameService } from './bay2game.service';

@Global()
@Module({
  providers: [SoraTopupService, Bay2GameService],
  exports: [SoraTopupService, Bay2GameService],
})
export class ProviderModule {}
