import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsAdminController } from './posts.admin.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController, PostsAdminController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
