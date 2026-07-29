## Context

云 MySQL 5.7 已建空表（C1），后端接口就绪（C2–C4）。现需把 sqlite.db 的真实数据迁入：1 user（真实 bcrypt 哈希）、1 post（tags 双重编码 JSON 字符串）、55 animes。
MySQL 当前因 C2 测试留有 1 条 admin 用户（密码 test123456），迁移需覆盖它。

## Goals / Non-Goals

**Goals:** 迁移三表真实数据；行数/时间/tags/密码四项契约不破坏；脚本可重复执行（幂等）；自增对齐。

**Non-Goals:** 不做增量迁移（全量清空+导入）；不修改 sqlite.db（只读）。

## Decisions

### 决策 1：迁移前清空目标三表（幂等）
**选择**：每次迁移前 `DELETE FROM` 三表，再全量导入。
**理由**：MySQL 已有 C2 测试数据，不清空会主键冲突；幂等使脚本可重复执行、失败可重跑。

### 决策 2：时间用 UTC 分量构造 'YYYY-MM-DD HH:MM:SS.mmm' 字符串（关键陷阱）
**背景**：首次用 `.toISOString()`（带 `Z` 后缀）插入，MySQL 5.7 报 `ER_TRUNCANGED_WRONG_VALUE`——5.7 的 DATETIME 不接受 ISO 8601 带 `Z` 格式。
**选择**：手写函数从 Date 的 UTC 分量拼 `YYYY-MM-DD HH:MM:SS.mmm`。
**理由**：DATETIME 列无时区语义，存储值就是 UTC 字面量；用 UTC 分量保证存储的是真实 UTC 时间。

### 决策 3：mysql2 连接设 `timezone: 'Z'`（关键陷阱）
**背景**：校验发现读取时间比期望少 8 小时——mysql2 默认 `timezone:'local'`（本机 UTC+8），把 DATETIME 当本地时间解析，导致偏移。
**选择**：迁移与校验脚本的 mysql2 连接均设 `timezone:'Z'`，读写都按 UTC。
**理由**：与决策 2 的 UTC 存储语义闭环，往返一致。

### 决策 4：Prisma 无需额外时区配置
**验证**：后端 Prisma 读 anime#61 时间 = `2026-01-13T16:57:36.000Z`，与 SQLite UTC 完全一致。Prisma 对 MySQL DATETIME 默认按 UTC 处理，与迁移存储语义一致，无需配置。

### 决策 5：tags 原样字符串搬运
SQLite posts.tags 为 `"[\"Vue\"]"`（双重编码字符串），原样写入 LongText，前端 `JSON.parse` 契约不变。

### 决策 6：password 原样 bcrypt 哈希
不重新哈希；迁移后 C2 测试密码 test123456 登录失败（被真实哈希覆盖），符合「密码复用」契约。

## Risks / Trade-offs

- **[清空目标表是破坏性操作]** → 仅在迁移期对空库/测试库执行；sqlite.db 只读兜底；正式数据已校验。
- **[时区配置分散在脚本/Prisma]** → 已记录决策，frontend 收到的统一是 ISO UTC 字符串，前端 `new Date()` 正确。

## Migration Plan

执行 `node migrate-sqlite-to-mysql.mjs` → `node verify.mjs`。回滚：重跑迁移（幂等）。
