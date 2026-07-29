## Context

C1 是后端工程地基。目标是搭起可运行的 NestJS 工程、接入 MySQL、建好三表，为 C2–C4 业务模块铺路。
云库为 MySQL **5.7.40**（非 8.x），账号 admin 无 `CREATE DATABASE` 权限。

## Goals / Non-Goals

**Goals:** NestJS 可启动；Prisma 接入 MySQL；三表建立；全局基建（/api 前缀、ValidationPipe、CORS、异常过滤器、PrismaModule、bcrypt 工具）就位。

**Non-Goals:** 不实现任何业务接口（C2–C4）；不写 seed（C5 迁移会带入数据）。

## Decisions

### 决策 1：Prisma 从 7.x 降级到 6.x LTS（关键）
**背景**：`npx prisma init` 默认装 Prisma 7.x，其生成的 client 为 **ESM 格式**（使用 `import.meta.url`），而 NestJS 项目是 CommonJS（装饰器元数据依赖 CJS），导致 `ReferenceError: exports is not defined` 与 `Cannot use 'import.meta' outside a module`。
**选择**：降级到 Prisma 6.x LTS（`prisma@6.19.3` + `@prisma/client@6.14`），用传统 `provider = "prisma-client-js"` 输出到 `node_modules/@prisma/client`（CJS）。
**理由**：Prisma 6 是生产主流版本，对 NestJS CJS 完美支持；Prisma 7 的 ESM-first 与 NestJS 生态尚有摩擦。降级零功能损失。
**备选**：把整个 backend 改为 ESM → 与 NestJS 装饰器深度耦合，改造代价极大，否决。

### 决策 2：放弃 `prisma migrate dev`，改用 `prisma db push`
**背景**：云库 admin 账号无 `CREATE DATABASE` 权限，而 `migrate dev` 需要创建影子库（shadow database）做迁移比对，报 `P3014`。
**选择**：用 `prisma db push` 直接对目标库应用 schema。
**理由**：`db push` 不需要影子库，适合受限权限的云库；本场景 schema 即真相、无需复杂迁移历史。
**权衡**：失去迁移文件历史。可接受——重构期 schema 变动由 OpenSpec change 管理；正式上线后如需迁移历史可重新引入具备建库权限的流程。

### 决策 3：tsconfig 用 commonjs 而非 nodenext
**背景**：NestJS CLI 生成的 tsconfig 默认 `module: nodenext`，与 CJS 依赖（Prisma client、NestJS 内部）冲突。
**选择**：改 `module/moduleResolution` 为 `commonjs/node`。
**理由**：NestJS 生态以 CJS 为主，避免不必要的模块解析问题。

### 决策 4：backend/package.json 显式声明 `"type": "commonjs"`
**背景**：仓库根 `package.json` 有 `"type": "module"`（原 Nuxt 项目），Node 向上查找会把 `backend/dist/**/*.js` 误判为 ESM。
**选择**：在 `backend/package.json` 加 `"type": "commonjs"` 覆盖。
**理由**：子工程模块系统独立，避免被根 ESM 配置污染。

### 决策 5：tags 用 LongText 而非原生 JSON 类型
见 architecture/data-migration spec：保持「JSON 字符串」契约，前端 `JSON.parse` 零改动。

## Risks / Trade-offs

- **[Prisma 6 长期支持]** → Prisma 6 是当前 LTS，维护有保障；若未来 NestJS 完整支持 ESM 可再升级。
- **[db push 无迁移历史]** → 当前可接受；上线迁移需求出现时引入。
- **[云库 5.7 而非 8.x]** → 已验证 Prisma 6 + MySQL 5.7 兼容；JSON/DATETIME(3)/utf8mb4 均支持。

## Migration Plan

无数据迁移（C5 专项）。回滚：删除 `backend/` + `DROP TABLE users, posts, animes`。
