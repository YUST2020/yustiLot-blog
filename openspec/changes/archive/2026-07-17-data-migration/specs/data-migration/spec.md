## ADDED Requirements

### Requirement: 迁移脚本与校验工具实现就绪

`scripts/` MUST 提供：
- `migrate-sqlite-to-mysql.mjs`：读 SQLite 写 MySQL，时间 ×1000 换算、tags 原样、password 原样、迁移前清空目标表、迁移后对齐 AUTO_INCREMENT。
- `verify.mjs`：行数、时间 ISO 等值、tags 逐字三重校验。
满足现有 `data-migration` spec 全部场景。

#### Scenario: 脚本可重复执行
- **WHEN** 多次运行 migrate
- **THEN** 每次先清空 MySQL 三表再导入，结果幂等
