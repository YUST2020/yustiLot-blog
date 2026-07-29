# Architecture Specification

> 架构能力：前后端分离的工程结构、技术栈、跨切面约束。
> 描述目标态架构（重构后），功能与现有等价。

## Purpose

定义 `frontend/` + `backend/` + `scripts/` 的 monorepo 结构、技术栈选型与全局工程约束，作为所有 change 的架构基线。
## Requirements
### Requirement: 后端技术栈

`backend/` MUST 采用：
- 框架 NestJS；
- ORM Prisma；
- 数据库 MySQL 8（字符集 `utf8mb4`，排序规则 `utf8mb4_bin` 以保证大小写敏感）；
- 鉴权 `@nestjs/jwt` + `bcryptjs`；
- 配置 `@nestjs/config`（`.env`）；
- 校验 `class-validator` + `class-transformer`。
全局 MUST 启用 `ValidationPipe`、统一 `/api` 路由前缀、CORS。

#### Scenario: 大小写敏感唯一约束
- **WHEN** 已存在 username=`admin`，再尝试创建 `Admin`
- **THEN** 因 utf8mb4_bin 排序规则，触发唯一约束冲突

### Requirement: 前端技术栈

`frontend/` MUST 采用：
- 构建 Vite + Vue 3.5 + TypeScript；
- 路由 vue-router 4；
- 状态 Pinia；
- HTTP axios + 拦截器；
- 样式 Tailwind CSS v4（`@tailwindcss/vite` 插件）；
- 组件库现有 Shadcn-vue（reka-ui / radix-vue）原样复用；
- Markdown `markdown-it` + `@tailwindcss/typography`；
- 动效 @vueuse/core、@vueuse/motion、three、@tweenjs/tween.js；
- 深浅色自实现 class 切换（替代 @nuxtjs/color-mode）；
- 图标 lucide-vue-next；提示 vue-sonner。

#### Scenario: 开发期 API 代理
- **WHEN** 前端 dev server 收到 /api/** 请求
- **THEN** 经 Vite proxy 转发到后端 dev server（如 http://localhost:3000）

### Requirement: API 契约对齐

后端接口 MUST 与现有 Nuxt 接口的**路径、HTTP 方法、入参、出参结构**完全一致（详见 auth/posts/animes spec）。
唯一新增接口为 `GET /api/auth/me`（前端分离后用于恢复登录态）。
鉴权方式从 Cookie Session 改为 JWT（`Authorization: Bearer <token>`），属预期内的破坏性变更。

#### Scenario: 公开接口返回结构不变
- **WHEN** 调用 GET /api/posts
- **THEN** 返回裸数组（与现状一致），非分页对象

### Requirement: 时间序列化约定

后端 MUST 将所有时间字段（`created_at` / `updated_at` / `published_at`）以 ISO 8601 字符串序列化输出，UTC 存储（`DATETIME(3)`）。

#### Scenario: 时间序列化
- **WHEN** 接口返回含时间字段的文章
- **THEN** 该字段为 ISO 8601 字符串，前端 new Date() 可正确解析

### Requirement: 深浅色适配

所有前端页面与组件 MUST 同时适配深色与浅色模式，视觉与现有 Nuxt 版本一致。
MUST 基于现有 HSL 语义变量（`--background` / `--foreground` / `--primary` 等）建立 Tailwind v4 token 体系，保证 `bg-background` / `text-foreground` 等类名零改动。

#### Scenario: 深浅色切换
- **WHEN** 用户切换深浅色
- **THEN** 全站视觉与现有 Nuxt 版本一致，无未适配区域

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

### Requirement: 端到端联调通过

前后端同时启动后，MUST 通过端到端联调验证完整链路：
- 公开页面正确加载后端数据（/、/blog、/animes）。
- 登录成功后后台可访问并能完成文章/番剧 CRUD。
- 深浅色切换全站生效。
- tags JSON 字符串契约、时间 ISO 显示正确。

#### Scenario: 完整链路可用
- **WHEN** 启动 backend:3000 + frontend:5173
- **THEN** 前台页面渲染真实数据，登录后台可 CRUD

