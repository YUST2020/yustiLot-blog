## Why

重构为前后端分离架构需要一个干净的 monorepo 地基：独立的 `frontend/`、`backend/`、`scripts/` 目录，配套的 `.gitignore` 与文档引用。现有仓库是单一 Nuxt 工程，后续 C1–C10 都依赖这个目录结构就位才能开始垂直切片。本 change 不改动任何业务功能，只搭骨架。

## What Changes

- 在仓库根创建 `frontend/`、`backend/`、`scripts/` 三个空目录（各含 `.gitkeep` 占位）。
- 更新根 `.gitignore`，覆盖各子项目的 `node_modules/`、`dist/`、`.env`、构建产物。
- 在 `docs/` 新增 `REFACTOR_PROGRESS.md`：作为 11 个 change（C0–C10）的总进度看板与依赖关系图，每完成一个 change 更新。
- 不创建任何业务代码、不动现有 Nuxt 代码（旧代码作为回滚兜底保留至 C10）。
- **BREAKING**：无（纯目录与文档变更，对现有运行无影响）。

## Capabilities

### New Capabilities

- `project-layout`: 仓库 monorepo 目录结构落地（三目录就位、.gitignore 覆盖、进度看板）。本 change 引入该 capability 的全部 requirement。

### Modified Capabilities

无。不修改任何现有 spec 的 requirement（注：原 `architecture` spec 中「Monorepo 目录结构」requirement 已迁移至本 `project-layout` capability，避免重复）。

## Impact

- **代码**：仓库根新增三个目录、`.gitkeep` 占位文件；`.gitignore` 扩充。
- **文档**：`docs/REFACTOR_PROGRESS.md` 新增。
- **依赖/系统**：无。本 change 不安装任何 npm 依赖（各子工程的依赖在 C1/C6 初始化时安装）。
- **回滚**：删除新增目录与文件即可，零风险。
