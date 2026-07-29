import { Module } from '@nestjs/common';
import { AnimesController } from './animes.controller';
import { AnimesAdminController } from './animes.admin.controller';
import { AnimesService } from './animes.service';

@Module({
  controllers: [AnimesController, AnimesAdminController],
  providers: [AnimesService],
  exports: [AnimesService],
})
export class AnimesModule {}
