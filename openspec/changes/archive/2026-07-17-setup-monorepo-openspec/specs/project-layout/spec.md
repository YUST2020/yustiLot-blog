## ADDED Requirements

### Requirement: Monorepo 三目录就位

仓库 MUST 采用单仓 monorepo 结构，根目录下存在 `frontend/`、`backend/`、`scripts/` 三个目录。
每个目录在尚无实际内容时 MUST 含 `.gitkeep` 占位文件以保证被 Git 追踪。
- `frontend/`：后续承载 Vite + Vue 3 SPA 工程（C6 起填充）。
- `backend/`：后续承载 NestJS 工程（C1 起填充）。
- `scripts/`：后续承载一次性数据迁移脚本（C5 起填充）。
- `docs/`：保留现有文档，并新增 `REFACTOR_PROGRESS.md` 进度看板。
- 旧 Nuxt 代码（`app/`、`server/`、根配置）MUST 在全部验收通过、流量切换前保留在仓库根作为回滚兜底。

#### Scenario: 三目录存在
- **WHEN** C0 完成后检查仓库根
- **THEN** frontend/、backend/、scripts/ 三个目录均存在且含 .gitkeep

#### Scenario: 旧代码保留
- **WHEN** C0 完成
- **THEN** 现有 app/、server/、nuxt.config.ts 等未被删除或修改

### Requirement: .gitignore 覆盖子工程

根 `.gitignore` MUST 覆盖三个子工程未来的忽略需求，且不破坏现有 Nuxt 工程的忽略规则：
- 通用：各子工程 `node_modules/`、`dist/`、`.env*`（保留 `.env.example`）、`*.log`。
- `frontend/`：`.vite/` 等构建缓存。
- `backend/`：Prisma 本地产物（如有）。
- 现有 Nuxt 规则（`.output`、`.nuxt`、`.nitro`、`.cache` 等）MUST 原样保留。

#### Scenario: 子工程依赖被忽略
- **WHEN** 子工程安装依赖产生 frontend/node_modules 等
- **THEN** 这些路径被根 .gitignore 忽略，不进入版本控制

#### Scenario: 现有规则不破坏
- **WHEN** 检查 .gitignore
- **THEN** 仍包含 .output、.nuxt、.nitro、.cache、dist、node_modules 等原有规则

### Requirement: 重构进度看板

`docs/` MUST 新增 `REFACTOR_PROGRESS.md`，作为 C0–C10 共 11 个 change 的总进度看板，包含：
- 每个 change 的标识、状态（pending / in-progress / done）、所属 capability spec。
- change 之间的依赖关系图（单向依赖链）。
- 每个 change 的验收点摘要。
约定：每完成（archive）一个 change 时同步更新本看板的状态。

#### Scenario: 看板完整
- **WHEN** C0 完成
- **THEN** docs/REFACTOR_PROGRESS.md 列出 C0–C10 全部 11 个 change 及其依赖与状态

#### Scenario: 状态随进度更新
- **WHEN** 某 change 完成
- **THEN** 进度看板中该 change 状态更新为 done
