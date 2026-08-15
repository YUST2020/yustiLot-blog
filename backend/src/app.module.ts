import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { PostsModule } from './modules/posts/posts.module';
import { AnimesModule } from './modules/animes/animes.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    // 全局加载 .env
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PostsModule,
    AnimesModule,
    ProjectsModule,
  ],
  providers: [
    // 全局守卫：默认所有接口需鉴权，@Public() 标记的豁免
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
