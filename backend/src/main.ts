import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  // 全局 /api 前缀，对齐现有 Nuxt 接口路径
  app.setGlobalPrefix('api');

  // 全局校验管道：自动剔除多余字段、类型转换、校验失败返回 400
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS：允许前端开发源
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  await app.listen(port);
  new Logger('Bootstrap').log(`🚀 Backend running on http://localhost:${port}/api`);
}
bootstrap();
