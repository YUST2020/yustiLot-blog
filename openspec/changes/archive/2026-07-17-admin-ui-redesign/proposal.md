## Why

现有后台沿用迁移自 Nuxt 的 shadcn-vue 控件，视觉陈旧、控件风格不统一、缺乏「现代化简约专业」气质。本次重构将后台表单控件统一为 Native HTML + Tailwind v4（基于 token），整体采用现代 SaaS 简约风（Linear/Vercel 后台风），并重写 AGENTS.md 反映重构后的全栈分离架构与新规范。

## What Changes

### 设计语言（详见 design.md）
- 现代简约 SaaS 风：白底/浅灰、克制配色、细边框（1px）、柔和阴影、圆角 lg、高信息密度。
- 全部基于现有 HSL token（`bg-background/card/border/foreground/muted/primary` 等），深浅色自动适配。
- 新增少量工具类约定（卡片、表单控件、表格、状态徽标）。

### 后台组件重构
- **AdminLayout**：侧边栏（分组导航、激活态、hover）+ 顶栏（面包屑/搜索/主题/头像）现代化。
- **仪表盘**：统计卡片网格 + 最近文章列表。
- **文章管理**：表格现代化（行 hover、状态徽标、操作图标）+ 工具栏。
- **PostForm**：native 表单控件（input/textarea/checkbox）+ token 样式，替代裸样式。
- **番剧管理**：表格 + 工具栏（搜索/排序/分页）现代化。
- **AnimeForm + AnimeDialog**：shadcn 控件 → native+token；AnimeDialog 保留弹窗（可保留 dialog 原语或 native）。
- **LoginDialog**：登录卡片美化。

### 文档
- 重写 `AGENTS.md`：反映前后端分离架构、token 体系、native+token 表单规范、后台设计语言。

## Capabilities

### New Capabilities
无新 capability。

### Modified Capabilities
- `frontend`: 修订后台页面与组件的视觉/交互 requirement（native 表单、SaaS 风、token 规范）。
- `project-layout`（AGENTS.md）：更新开发准则（通过 project.md 反映）。

## Impact

- **代码**：重构 `layouts/AdminLayout.vue`、`pages/admin/**`、`components/admin/**`、`LoginDialog.vue`。
- **样式**：复用现有 token，main.css 可能补充少量工具类。
- **依赖**：不新增（纯 native + Tailwind）。
- **回滚**：单 change，可整体 revert。
