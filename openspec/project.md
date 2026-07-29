# Project Context

> 本文件供 OpenSpec 在创建 proposal/spec/design/tasks 等 artifact 时读取，提供项目全局上下文。
> 高层分析见 `docs/REFACTOR_FEASIBILITY.md`，落地总方案见 `docs/REFACTOR_PLAN.md`。

## 项目性质

个人博客系统（前台展示 + 后台 CMS），当前为 **Nuxt 4 单体全栈应用**，正在重构为 **前后端分离架构**。
**功能与视觉在重构前后保持 1:1 一致**，仅实现层变更——这是 spec-driven 的核心约束：所有 spec 描述的是「目标态功能契约」，与现有系统功能等价。

## 目标架构（重构后）

- **单仓 monorepo**：`frontend/` + `backend/` + `scripts/`，代码同库存放。
- **后端**（`backend/`）：NestJS + Prisma + MySQL 8（`utf8mb4_bin`）+ JWT 鉴权 + bcryptjs。
- **前端**（`frontend/`）：Vite + Vue 3.5 + TypeScript + Tailwind CSS v4 + vue-router 4 + Pinia + axios；Shadcn-vue（reka-ui/radix-vue）组件原样复用。
- **API 契约**：统一 `/api` 前缀，**路径/入参/出参与现有 Nuxt 接口完全对齐**（详见各 capability spec）。

## 业务领域（三大模块）

1. **Auth（鉴权）**：管理员登录/登出/当前用户；首次 `admin` 自动建号；JWT。
2. **Posts（博客文章）**：公开列表/详情；管理端 CRUD；Markdown 内容；tags 以 JSON 字符串存储。
3. **Animes（番剧记录）**：公开分页列表（时间轴/评分排序）；管理端 CRUD（搜索/排序/分页）；评分 0–10 含半分；季度 {1,4,7,10}。

## 关键不变式（跨 spec 必须遵守）

- `posts.tags` 在数据库以 **JSON 字符串** 存储，前端 `JSON.parse` 解析；迁移后必须保持该契约。
- `animes.rating` 为 0–10 整数（含奇数半分）；`animes.release_quarter` 仅允许 {1,4,7,10}。
- `GET /api/posts` 返回**裸数组**；`GET /api/animes` 返回**分页对象** `{ items, total, page, pageSize, totalPages }`——两个结构不一致，各自 spec 已固化。
- `publishedAt` 写入规则：`isPublished && !publishedAt` → 当前时间；有值 → 解析传入值；否则 null。
- 密码使用 bcrypt（10 轮），哈希与数据库无关，迁移原样复用，**不得重置密码**。
- 时间字段：旧库为 epoch 秒，新库为 `DATETIME(3)`（UTC 存储），服务层对外序列化为 ISO 8601。

## 现有文档

- `docs/REFACTOR_FEASIBILITY.md`：数据结构、路由、API、数据库迁移的完整梳理与可行性结论。
- `docs/REFACTOR_PLAN.md`：落地总方案（目录结构、Prisma schema、Tailwind v4 token、阶段计划、验收清单）。
- `docs/{PRD,DESIGN_DOC,TECH_STACK,ANIME_MODULE_PLAN}.md`：原始需求与设计文档。
- `AGENTS.md`：开发准则（深浅色适配、Shadcn-vue 优先、中文注释、函数式弹窗）。

## 编码与样式规范（继承自 AGENTS.md）

- 所有页面必须同时适配深色/浅色模式（语义化 token，`dark:` 变体）。
- **前台**：使用 `frontend/src/components/ui/**` 下的 shadcn-vue 组件。
- **后台表单**：原生 HTML 控件 + Tailwind v4（基于 token），**不使用** shadcn-vue 的 Input/Label/Select/Button；后台采用现代简约 SaaS 风（卡片/表格/徽标样式见 AGENTS.md §3）。
- 注释使用中文，精简原则（仅在复杂逻辑/边界/hack 处标注）。
- 复杂业务弹窗使用 `useDialogOpen` 函数式调用，弹窗用 native + Teleport + token（不依赖 radix/reka Dialog 原语）。
- 移动端优先响应式。

## OpenSpec 工作约定（本仓库自定义）

- **Base spec 建模策略**：`openspec/specs/*/spec.md` 描述**目标态功能契约**（与现状功能等价，仅实现不同）。
- **Change 颗粒度**：11 个细粒度 change（C0–C10），每个 change 独立可验收、可独立 PR。依赖链单向。
- **每个 change 必备**：`proposal.md` + `tasks.md`；涉及技术决策的另加 `design.md`。
- **不勾选未完成的 task**；验收未通过的 change 不 archive。
