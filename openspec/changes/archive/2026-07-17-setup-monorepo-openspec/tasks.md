## 1. 创建子项目目录

- [x] 1.1 创建 `frontend/` 目录并添加 `.gitkeep`
- [x] 1.2 创建 `backend/` 目录并添加 `.gitkeep`
- [x] 1.3 创建 `scripts/` 目录并添加 `.gitkeep`

## 2. 更新 .gitignore

- [x] 2.1 在根 `.gitignore` 追加 frontend 子工程的忽略规则（`frontend/node_modules/`、`frontend/dist/`、`frontend/.vite/`、`frontend/.env*`、`!frontend/.env.example`）
- [x] 2.2 追加 backend 子工程的忽略规则（`backend/node_modules/`、`backend/dist/`、`backend/.env`、`!backend/.env.example`）
- [x] 2.3 追加 scripts 目录的忽略规则（`scripts/node_modules/`、`scripts/*.log`）
- [x] 2.4 保留现有 Nuxt 工程忽略规则（`.output`、`.nuxt`、`.nitro`、`.cache`、`dist` 等）不动

## 3. 编写进度看板文档

- [x] 3.1 新建 `docs/REFACTOR_PROGRESS.md`，包含 C0–C10 的 change 列表、状态、依赖关系图、各 change 所属 spec、验收点
- [x] 3.2 标注 C0 状态为 in-progress，其余为 pending

## 4. 验收

- [x] 4.1 确认 `frontend/`、`backend/`、`scripts/` 三个目录存在且含 `.gitkeep`
- [x] 4.2 确认根 `.gitignore` 覆盖三子工程忽略项且未破坏现有 Nuxt 规则
- [x] 4.3 确认 `docs/REFACTOR_PROGRESS.md` 完整描述 11 个 change 的依赖与状态
- [x] 4.4 确认未修改任何现有 Nuxt 代码（`app/`、`server/`、根配置文件）
