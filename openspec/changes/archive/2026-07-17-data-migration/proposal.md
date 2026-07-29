## Why

后端接口（C1–C4）就绪，云 MySQL 已建空表。现需把 SQLite（`sqlite.db`）中的真实数据迁移至 MySQL：1 个用户（含真实 bcrypt 哈希）、1 篇文章、55 条番剧。这是前端联调（C8+）的数据前提，也是「密码不重置、时间等价、tags 契约不破坏」契约的落地验证点。

## What Changes

- 在 `scripts/` 建 Node 项目，编写 `migrate-sqlite-to-mysql.mjs`：
  - 读 SQLite 三表（用根仓库已有 `@libsql/client`）。
  - 写 MySQL（用 `mysql2`）。
  - 时间 `epoch 秒 × 1000 → Date → ISO`；`tags` 原样字符串；`password` 原样 bcrypt 哈希。
  - 迁移前清空 MySQL 三表（避免与 C2 测试建的 admin 冲突），再全量导入。
  - 迁移后对齐 AUTO_INCREMENT = MAX(id)+1。
- 编写 `verify.mjs`：行数比对 + 时间 ISO 等值 + tags 逐字 + 登录验证。

## Capabilities

### New Capabilities
无。落地现有 `data-migration` spec。

### Modified Capabilities
- `data-migration`: 首次落地全部迁移 requirement（时间换算、tags 原样、密码复用、自增对齐、可回滚）。

## Impact

- **数据**：云 MySQL blog 库三表填充真实数据（清空后导入）。
- **代码**：`scripts/` 新增 migrate/verify 脚本与 package.json。
- **回滚**：sqlite.db 只读、不修改；失败可清空 MySQL 重跑。
