## 1. NestJS 工程初始化

- [x] 1.1 在 backend/ 用 NestJS CLI 初始化工程（strict 模式）
- [x] 1.2 清理默认 controller/service，建立模块目录结构（common/modules/utils）

## 2. 依赖与 Prisma 接入

- [x] 2.1 安装 @nestjs/config、@nestjs/jwt、@nestjs/passport、passport/jwt、bcryptjs、class-validator/transformer、@prisma/client
- [x] 2.2 降级 Prisma 至 6.x LTS（provider=prisma-client-js，CJS），删除 prisma.config.ts 与 generated/
- [x] 2.3 编写 prisma/schema.prisma（User/Post/Anime，字段 1:1 对齐，snake_case @map，tags 用 LongText）
- [x] 2.4 创建 .env（真实凭据，DATABASE_URL 指向云库）与 .env.example（模板入库）

## 3. 建表与 Client 生成

- [x] 3.1 用 prisma db push 建三表（云库无建库权限，放弃 migrate dev 的影子库机制）
- [x] 3.2 验证三表结构与 spec Data Model 一致（username/slug 唯一、tags 为文本、时间 DATETIME(3)）
- [x] 3.3 prisma generate 生成 client

## 4. 全局基建

- [x] 4.1 main.ts：全局 /api 前缀、ValidationPipe（whitelist+transform）、CORS、全局异常过滤器
- [x] 4.2 AllExceptionsFilter：业务异常映射 400/401/404，Prisma P2002/P2025 映射，响应体 {statusCode, message}
- [x] 4.3 PrismaModule（@Global）+ PrismaService（OnModuleInit/Destroy 管理连接）
- [x] 4.4 password.util.ts：bcrypt hash（10 轮）/compare 封装
- [x] 4.5 backend/package.json 声明 type:commonjs（避免被根 ESM 配置污染）

## 5. 验收

- [x] 5.1 TypeScript 编译零错误
- [x] 5.2 nest start 启动成功，监听 3000，/api 前缀生效
- [x] 5.3 GET /api/nonexistent 返回 404 JSON {statusCode:404, message}
- [x] 5.4 三表在云库存在且结构与 spec 一致
