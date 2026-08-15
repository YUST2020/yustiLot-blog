## Why

博客需要展示站长的个人作品（GitHub 项目等）。经确认采用**纯手工管理模式**：不做 GitHub API 同步，由管理员在后台手动创建/维护作品记录，前台提供作品展示页。

## What Changes

- 新增 `projects` 表与 Prisma model：名称、简介、封面、源码/预览链接、技术栈（JSON 字符串数组）、排序权重、可见性。
- 后端新增 `ProjectsModule`：
  - `GET /api/projects`（@Public）：返回全部可见作品数组，按 sort_order desc → created_at desc 排序，不分页（作品量级小）。
  - `GET/POST /api/admin/projects`、`GET/PUT/DELETE /api/admin/projects/:id`：管理端 CRUD（JWT 保护）。
- 前端前台：新增 `/projects` 作品展示页（粒子背景 hero + 卡片墙），顶部导航增加「作品」入口。
- 前端后台：新增 `/admin/projects` 管理页（表格 + 函数式弹窗表单），侧边栏增加「作品管理」。

## Capabilities

### New Capabilities
- `projects`: 个人作品的数据模型、公开列表与管理端 CRUD 契约（本次定义并落地）。

### Modified Capabilities
无。

## Impact

- **代码**：`backend/src/modules/projects/`、`frontend/src/pages/projects/`、`frontend/src/pages/admin/projects/`、`frontend/src/components/admin/Project{Form,Dialog}.vue`、路由与 DefaultLayout/AdminLayout 导航。
- **数据库**：新增 `projects` 表（`prisma db push`）。
- **回滚**：删除上述模块/页面/路由，drop `projects` 表。
