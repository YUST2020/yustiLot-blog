# AI Agent 开发准则 (Project Development Guidelines)

> 本仓库已重构为**前后端分离**架构（monorepo）：
> - `frontend/`：Vite + Vue 3 + TypeScript + Tailwind CSS v4（SPA）
> - `backend/`：NestJS + Prisma + MySQL（REST API）
> - `scripts/`：一次性数据迁移脚本
>
> 开发时请严格遵守以下规则，确保代码质量、风格一致与良好体验。

## 0. 工程结构与启动

- **后端**：`cd backend && npm run start:dev`（默认 :3000，`/api` 前缀）
- **前端**：`cd frontend && npm run dev`（默认 :5173，开发期 `/api` 自动代理到后端）
- 两端需同时启动联调；路径别名统一用 `@/`（指向各自 `src/`）。
- 数据库为云 MySQL 5.7，凭据存放于 `backend/.env`（不入库），见 `backend/.env.example`。

## 1. 样式与 Token 体系（核心）

*   **Token 体系**：
    *   颜色统一使用 `frontend/src/assets/css/main.css` 中定义的 HSL 语义 token（`--background`/`--foreground`/`--primary`/`--card`/`--border`/`--muted`/`--ring` 等）。
    *   在 Tailwind v4 中通过 `@theme inline` 映射为 `bg-background` / `text-foreground` / `border-border` 等类名。
    *   **禁止硬编码颜色值**（如 `bg-white`、`text-zinc-900`、`#fff`），必须使用语义 token 类，否则深浅色无法自动适配。
*   **深色/浅色模式**：
    *   所有页面和组件**必须**同时适配两种模式。
    *   token 已在 `:root` 与 `.dark` 下分别定义，只要使用语义类即自动适配。
    *   极少数语义色（如状态徽标 emerald/amber）需手动补 `dark:` 变体。
*   **响应式**：移动端优先，默认编写移动端样式，用 `md:`/`lg:` 断点适配桌面端。确保表格可横向滚动、弹窗在窄屏可完全显示。

## 2. 前端组件规范

*   **表单控件（后台）—— Native + Tailwind 优先**：
    *   后台所有表单（input/textarea/select/checkbox）**必须**使用原生 HTML 元素 + Tailwind v4（基于 token）。
    *   统一样式见 `frontend/src/components/admin/PostForm.vue`、`AnimeForm.vue`：
      *   输入框：`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ... focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring`。
      *   标签：`text-sm font-medium text-foreground`。
    *   **不再**在后台表单中使用 shadcn-vue 的 Input/Label/Select/Button 等控件。
*   **前台 UI 组件**：
    *   前台公开页面仍使用 `frontend/src/components/ui/**` 下的 shadcn-vue 组件（Button/Badge/Card 等）。
    *   特效背景组件（`RubiksCubeBackground`、`ParticleBackground`）保持不变。
*   **按钮约定**（后台 native）：
    *   主按钮：`bg-primary text-primary-foreground hover:bg-primary/90`，`h-10 px-4 rounded-md text-sm font-medium`。
    *   次按钮（outline）：`border border-input bg-background hover:bg-secondary`。
    *   图标按钮：`h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-secondary`。

## 3. 后台设计语言

后台采用**现代简约 SaaS 风**（对标 Linear / Vercel Dashboard）。详见 `openspec/changes/archive/*/design.md` 中的「后台 UI 重构设计语言」。

*   **卡片**：`rounded-lg border border-border bg-card shadow-sm`。
*   **表格**：容器 `rounded-lg border bg-card shadow-sm overflow-hidden`；表头 `bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground`；行 `hover:bg-muted/30 transition-colors`；分隔 `divide-y divide-border`；单元格 `px-4 py-3`。
*   **状态徽标**：native span + 语义色 + `rounded-full px-2 py-0.5 text-xs font-medium`：
    *   已发布/成功：`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`
    *   草稿/待定：`bg-amber-500/10 text-amber-600 dark:text-amber-400`
*   **布局（AdminLayout）**：侧边栏 `w-64 bg-card border-r`，导航项激活态 `bg-primary/10 text-primary`（用 `router-link-exact-active`）；顶栏 `h-16 border-b bg-background/80 backdrop-blur`。
*   **动效**：统一 `transition-colors duration-200`，避免夸张位移。

## 4. 弹窗交互规范

*   **函数式弹窗优先**：
    *   复杂业务弹窗（如表单、确认框）使用 `useDialogOpen`（`frontend/src/composables/useDialogOpen.ts`）函数式调用，避免在模板维护大量 `visible` 状态。
    *   示例：`useDialogOpen(AnimeDialog, { isEdit: true, initialData, onConfirm: async (data) => {...} })`。
*   **弹窗组件开发**：
    *   接收 `modelValue` (boolean) 控制显示，emit `update:modelValue`。
    *   通过 `emit('confirm', data)` 返回结果，`emit('cancel')` 取消。
    *   用 `<Teleport to="body">` + 遮罩 + 卡片样式（native + token），不再依赖 radix-vue/reka-ui 的 Dialog 原语。

## 5. 后端开发规范

*   **接口契约**：所有接口路径、入参、出参结构与 `openspec/specs/*/spec.md` 定义保持一致；改动接口**必须**先更新对应 spec。
*   **鉴权**：JWT（`Authorization: Bearer <token>`）；公开接口用 `@Public()` 装饰器豁免全局 `JwtAuthGuard`。
*   **DTO 校验**：用 `class-validator`；统一通过全局 `ValidationPipe`（校验失败 400）。
*   **异常**：通过全局 `AllExceptionsFilter` 统一映射为 `{ statusCode, message }`（400/401/404 等对齐前端预期）。
*   **时间**：统一 `DATETIME(3)` UTC 存储，接口返回 ISO 8601 字符串。
*   **tags 契约**：`posts.tags` 以 **JSON 字符串**存储（非原生 JSON 类型），前端 `JSON.parse`，后端原样存取，不要改变这一约定。

## 6. 代码注释

*   **中文注释**：所有注释使用中文。
*   **精简原则**：
    *   拒绝废话：不为自解释代码写注释（如 `getUserList()` 上方不写「获取用户列表」）。
    *   仅在以下情况添加注释：复杂业务逻辑/算法、特殊边界条件、不得不用的 Hack 及原因、复杂正则或难懂配置。

## 7. OpenSpec 工作流

*   任何功能性变更**必须**通过 OpenSpec 管理：先写 proposal/design/specs delta/tasks，`openspec validate` 通过后再实施。
*   Base spec（`openspec/specs/*/spec.md`）是功能契约的**唯一真相**，代码与 spec 不得漂移。
*   一个 change 完成并验收后 `openspec archive <change>` 合并回 base spec。
