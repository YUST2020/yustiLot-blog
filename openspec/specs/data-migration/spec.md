# Data Migration Specification

> 数据迁移能力：将 SQLite（`sqlite.db`）数据无损迁移至 MySQL。
> 数据量小（种子规模），但时间格式与 JSON 语义须严格处理。

## Purpose

保证重构后 MySQL 数据库的数据与现有 SQLite 等价，**密码哈希、时间、tags 契约不破坏**。
## Requirements
### Requirement: 数据库初始化

MySQL 数据库 MUST 以 `utf8mb4` 字符集、`utf8mb4_bin` 排序规则创建，以对齐 SQLite 的大小写敏感行为。
Prisma schema MUST 通过 `@@map` / `@map` 保持现有 snake_case 列名，便于与迁移脚本对齐。

#### Scenario: 建库
- **WHEN** 执行后端初始化
- **THEN** 数据库为 utf8mb4 / utf8mb4_bin，三张表结构符合 posts/animes/auth spec 的 Data Model

### Requirement: 三表全量迁移

迁移脚本 MUST 将 `users`、`posts`、`animes` 三张表的**全部行**迁移至 MySQL，字段一一映射。

#### Scenario: 行数一致
- **WHEN** 迁移完成
- **THEN** MySQL 各表行数等于 SQLite 对应表行数

### Requirement: 时间字段换算

现有 SQLite 时间以 **epoch 秒（integer）** 存储。迁移时 MUST 将其 `* 1000` 转为毫秒再构造 `Date`，写入 MySQL 的 `DATETIME(3)` 列。
覆盖字段：`users.created_at`、`posts.{created_at, updated_at, published_at}`、`animes.{created_at, updated_at}`。`published_at` 可能为 null，MUST 原样保留 null。

#### Scenario: 时间等值
- **WHEN** 抽样比对迁移前后
- **THEN** `new Date(sqlite_val * 1000).toISOString()` === MySQL 值的 ISO 字符串

#### Scenario: null 时间保留
- **WHEN** 某 post 的 published_at 在 SQLite 为 null
- **THEN** MySQL 中该字段同为 null

### Requirement: tags 字符串原样迁移

`posts.tags` MUST 以**字符串原样**搬运（不做 JSON.parse / 重新序列化），保持「JSON 字符串」契约不变。

#### Scenario: tags 逐字相等
- **WHEN** 比对迁移前后 posts.tags
- **THEN** 字符串完全相等（含转义、顺序）

### Requirement: 密码哈希原样迁移

`users.password`（bcrypt 哈希）MUST 原样搬运，**不重新哈希、不要求重置**。迁移后用原明文密码即可登录。

#### Scenario: 旧密码可登录
- **WHEN** 迁移后用原管理员明文密码调用 POST /api/auth/login
- **THEN** bcrypt 比对成功，登录通过

### Requirement: 自增主键对齐

迁移完成后 MUST 将各表 `AUTO_INCREMENT` 起始值对齐为 `MAX(id) + 1`，避免后续新插入主键冲突。

#### Scenario: 自增不冲突
- **WHEN** 迁移后创建新文章/番剧/用户
- **THEN** 新 id 严格大于现有最大 id，不发生主键冲突

### Requirement: 迁移可回滚

迁移过程中 MUST **只读** `sqlite.db`，不修改不删除。失败时可直接重建 MySQL 库重跑；`sqlite.db` 始终作为回滚兜底，直至 C10 流量切换且验收通过。

#### Scenario: 迁移失败可重试
- **WHEN** 迁移脚本中途失败
- **THEN** sqlite.db 完好无损，清空 MySQL 库后可重新执行迁移

### Requirement: 迁移脚本与校验工具实现就绪

`scripts/` MUST 提供：
- `migrate-sqlite-to-mysql.mjs`：读 SQLite 写 MySQL，时间 ×1000 换算、tags 原样、password 原样、迁移前清空目标表、迁移后对齐 AUTO_INCREMENT。
- `verify.mjs`：行数、时间 ISO 等值、tags 逐字三重校验。
满足现有 `data-migration` spec 全部场景。

#### Scenario: 脚本可重复执行
- **WHEN** 多次运行 migrate
- **THEN** 每次先清空 MySQL 三表再导入，结果幂等

