import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 全局 Prisma 服务模块，提供 PrismaClient 实例
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
