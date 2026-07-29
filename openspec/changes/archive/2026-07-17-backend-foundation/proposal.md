## Why

后端分离的第一步是搭好 NestJS 工程地基：脚手架、Prisma 接入 MySQL 5.7、全局配置、统一异常处理、CORS、`/api` 前缀，并把数据库表结构建好（users/posts/animes 三表）。这是 C2–C4 业务模块的前置依赖——没有工程骨架与建表，鉴权与业务接口无从落地。

## What Changes

- 在 `backend/` 初始化 NestJS 工程（TypeScript）。
- 接入 Prisma ORM，编写 `schema.prisma`（User/Post/Anime 三模型，字段与现有 SQLite 1:1 对齐，列名 snake_case via @map）。
- 连接云 MySQL 5.7（`106.15.67.226:3306/blog`），`prisma migrate dev` 建表。
- 实现全局基建：`ConfigModule`（.env）、`ValidationPipe`、统一 `/api` 路由前缀、CORS、全局异常过滤器（HTTP 状态码对齐现有：400/401/404）。
- 实现 `PrismaModule`（全局 PrismaClient provider）、`password.util.ts`（bcrypt hash/compare 封装）。
- 建 `.env`（含真实凭据，gitignore）与 `.env.example`（模板，入库）。
- 不实现任何业务接口（C2–C4 做）。

## Capabilities

### New Capabilities

无新 capability。本 change 落地 `architecture` spec 中「后端技术栈」「时间序列化约定」相关 requirement，并为后续 auth/posts/animes spec 的数据模型建表。

### Modified Capabilities

- `architecture`: 实现后端技术栈、API 契约前缀、时间序列化、CORS 等架构 requirement（首次落地）。

## Impact

- **代码**：`backend/` 下生成完整 NestJS 工程骨架。
- **数据库**：云 MySQL `blog` 库新建 `users`/`posts`/`animes` 三表（当前为空库）。
- **依赖**：安装 NestJS 全家桶、Prisma、bcryptjs、class-validator 等。
- **配置**：新增 `backend/.env`（凭据）、`backend/.env.example`。
- **回滚**：删除 `backend/` 目录 + `DROP TABLE` 三表即可；云库当前为空，零数据风险。
