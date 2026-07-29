## MODIFIED Requirements

### Requirement: AdminLayout 行为

后台布局 MUST 采用现代简约 SaaS 风（见 design.md），基于 token：
- 侧边栏 `w-64`、`bg-card border-r border-border`；导航项统一字号/圆角，激活态 `bg-primary/10 text-primary`（用 router-link-exact-active），hover `bg-secondary`。
- 顶栏 `h-16 border-b bg-background/80 backdrop-blur`，含主题切换。
- 未登录显示骨架屏并强制 LoginDialog（preventClose）；登录后用 `<router-view />` 渲染子路由。
- 移动端侧边栏抽屉化（lg 以下隐藏 + 汉堡触发）。

#### Scenario: 未登录访问后台
- **WHEN** 未登录访问任意 /admin/**
- **THEN** 显示骨架屏并弹出不可关闭的登录弹窗

#### Scenario: 登录后渲染
- **WHEN** 登录成功
- **THEN** 弹窗关闭，渲染后台内容（router-view）

#### Scenario: 激活态导航
- **WHEN** 当前路由为 /admin/posts
- **THEN** 「文章管理」导航项显示激活态（bg-primary/10 text-primary）

#### Scenario: 子路由渲染
- **WHEN** 登录后访问 /admin/posts
- **THEN** 主内容区通过 router-view 渲染文章管理页

## ADDED Requirements

### Requirement: 后台表单控件统一为 native+token

所有后台表单（文章/番剧的创建编辑、登录）MUST 使用原生 HTML 控件 + Tailwind v4（基于 token）：
- input/textarea/select/checkbox 遵循 design.md §4 的统一样式（h-10、border-input、focus ring-ring）。
- 禁止裸样式或与 design.md 不一致的控件样式。
- 标签使用 `text-sm font-medium text-foreground`。

#### Scenario: 输入框聚焦
- **WHEN** 聚焦任一后台表单输入框
- **THEN** 显示 ring-2 ring-ring 聚焦反馈，深浅色均适配

### Requirement: 后台视觉风格现代化

后台所有页面（仪表盘/文章/番剧管理）MUST 遵循 design.md 设计语言：
- 卡片 `rounded-lg border border-border bg-card shadow-sm`。
- 表格表头 `bg-muted/40 text-xs uppercase`，行 hover `bg-muted/30`。
- 状态徽标按语义色（emerald 已发布/amber 草稿）+ dark 变体。
- 工具栏（搜索 + 操作）布局统一。
- 全部基于 token，深浅色自动适配。

#### Scenario: 深浅色适配
- **WHEN** 在后台切换深浅色
- **THEN** 所有页面/控件视觉一致，无未适配区域
