## Context

重构目标是把单一 Nuxt 工程拆为 `frontend/` + `backend/` + `scripts/` 的 monorepo。C0 是整个重构的第一个 change，必须为后续 10 个 change 提供稳定的地基。

现状：仓库根是完整 Nuxt 工程（`app/`、`server/`、`nuxt.config.ts`、`package.json`、`sqlite.db` 等），无任何子目录工程。

约束：
- 旧 Nuxt 代码 MUST 保留至 C10 验收通过后才归档，作为回滚兜底。
- 现有 `openspec/` 目录与 `docs/` 目录 MUST 不受影响。
- 本 change 不安装 npm 依赖（避免在目录结构未稳定时引入冗余 node_modules）。

## Goals / Non-Goals

**Goals:**
- 建立 `frontend/`、`backend/`、`scripts/` 三个目录占位。
- 更新 `.gitignore` 一次性覆盖所有子项目未来的忽略需求。
- 建立进度看板 `docs/REFACTOR_PROGRESS.md`，作为 11 个 change 的总览。

**Non-Goals:**
- 不初始化任何子工程（Vite/NestJS 脚手架在 C1/C6 做）。
- 不安装任何 npm 依赖。
- 不修改现有 Nuxt 代码。
- 不配置 pnpm workspace（各子工程独立管理依赖，避免根 package.json 耦合；如后续需要再引入）。

## Decisions

### 决策 1：目录占位用 `.gitkeep` 而非空文件
**选择**：每个空目录放 `.gitkeep`。
**理由**：Git 不追踪空目录，`.gitkeep` 是社区惯例，语义明确（「此目录有意保留，待后续填充」）。
**备选**：直接在 C1/C6 创建子工程时才建目录 → 但这样 C0 无法独立提交且依赖关系不清晰，被否。

### 决策 2：`.gitignore` 采用「根级统一 + 子项注释分组」
**选择**：在根 `.gitignore` 追加 frontend/backend/scripts 各自的忽略规则，按注释分组，而非每个子目录各放一个 `.gitignore`。
**理由**：
- 单一 `.gitignore` 便于审查与维护，一眼看全忽略策略；
- 子目录的 `.gitignore` 在工程化阶段（C1/C6）按需补充工具特定的忽略项。
**备选**：每个子目录独立 `.gitignore` → 分散维护、易遗漏，被否。

需要覆盖的忽略项（基于 REFACTOR_PLAN.md 的技术栈推断）：
- 通用：`node_modules/`、`dist/`、`.env*`（保留 `.env.example`）、`*.log`、`.DS_Store`
- backend：`dist/`、`.env`、Prisma 生成产物路径（`prisma/migrations/dev.db*` 如用本地）
- frontend：`dist/`、`.env*`、`.vite/`

### 决策 3：进度看板用独立文件 `docs/REFACTOR_PROGRESS.md`
**选择**：新建 `docs/REFACTOR_PROGRESS.md` 记录 C0–C10 的状态、依赖、验收点。
**理由**：
- OpenSpec 的 `openspec list` 已能列出 changes，但无法表达**依赖关系图**和**总体里程碑**视角；
- 进度看板面向人类总览，与 OpenSpec 的 spec/change 面向契约管理互补。
**内容结构**：change 列表 + 状态（pending/in-progress/done）+ 依赖链 + 所属 spec + 验收点链接。

### 决策 4：不引入 pnpm workspace
**选择**：frontend/backend 各自独立 `package.json`，根 `package.json` 保持现状（Nuxt 工程用），不配置 workspace。
**理由**：重构期旧 Nuxt 工程与新旧子工程并存，引入 workspace 会增加配置复杂度与潜在冲突；待 C10 旧代码清理后再评估是否需要 workspace。
**备选**：现在就配 pnpm workspace → 复杂度高、收益低，被否。

## Risks / Trade-offs

- **[根 `.gitignore` 过于宽泛导致误忽略]** → 用具体路径前缀（如 `frontend/dist/`）而非裸 `dist/`，降低误伤；现有 Nuxt 产物的 `.output`/`.nuxt` 等规则保留不动。
- **[空目录占位被误删]** → `.gitkeep` + 在进度看板标注「待 C1/C6 填充」，降低误删风险。
- **[进度看板与 OpenSpec 状态漂移]** → 约定每个 change archive 时同步更新进度看板，作为 archive 流程的一部分。

## Migration Plan

无需迁移数据。部署：本 change 不影响任何运行中的服务（纯仓库结构变更）。
回滚：`git revert` 即可，无副作用。

## Open Questions

无。所有决策已基于 REFACTOR_PLAN.md 与现有结构确定。
