## ADDED Requirements

### Requirement: 后端工程骨架就绪

`backend/` MUST 存在一个可启动的 NestJS 工程，具备：
- 全局 `ValidationPipe`（开启 `whitelist`、`transform`，校验失败返回 400）。
- 全局 `/api` 路由前缀（所有控制器路径自动加 `/api`）。
- CORS 开启（允许前端开发源，来源由 `CORS_ORIGIN` 环境变量配置）。
- 全局异常过滤器，将业务异常映射为 HTTP 状态码（400 参数错误 / 401 未授权 / 404 未找到），响应体含 `statusCode` 与 `message`。
- `ConfigModule` 全局加载 `.env`。
- `PrismaModule` 全局提供 `PrismaClient`。

#### Scenario: 后端启动
- **WHEN** 执行 `npm run start:dev`
- **THEN** NestJS 在配置端口（默认 3000）监听，`/api` 前缀生效

#### Scenario: 参数校验失败
- **WHEN** 请求体不满足 DTO 约束
- **THEN** 返回 400 与错误信息

#### Scenario: CORS 生效
- **WHEN** 前端跨源请求 /api/**
- **THEN** 响应携带允许跨域的头

### Requirement: 数据库三表建立

Prisma `migrate dev` MUST 在 MySQL `blog` 库创建 `users`、`posts`、`animes` 三表，结构与 auth/posts/animes spec 的 Data Model 一致：
- 列名 snake_case（via `@map`）。
- `tags` 列为 `LongText`（存 JSON 字符串，非原生 JSON 类型）。
- 时间列 `DATETIME(3)`（UTC）。
- 唯一约束：`users.username`、`posts.slug`。
- 表字符集随库 `utf8mb4`，排序规则对齐大小写敏感。

#### Scenario: 三表存在
- **WHEN** migrate 完成
- **THEN** users/posts/animes 三表存在，列与 spec Data Model 一致

#### Scenario: tags 为文本列
- **WHEN** 检查 posts 表 tags 列
- **THEN** 类型为文本（非 JSON），可存任意 JSON 字符串

### Requirement: 密码哈希工具

`backend/` MUST 提供 `password.util.ts`，封装 bcryptjs 的 `hash(plain)`（10 轮）与 `compare(plain, hash)`。该工具供 C2 鉴权模块使用，行为与现有 Nuxt 版本兼容（10 轮 salt）。

#### Scenario: hash 与 compare
- **WHEN** 对明文密码调用 hash 再 compare
- **THEN** 返回 true
