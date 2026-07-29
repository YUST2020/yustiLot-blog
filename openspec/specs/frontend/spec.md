# Frontend Specification

> 前端能力：路由、页面、布局、组件、交互、样式。
> 功能与视觉 MUST 与现有 Nuxt 版本 1:1 一致；仅实现从 Nuxt 迁至 Vite + Vue 3 SPA。

## Purpose

定义前端迁移后必须保留的全部路由、页面行为、布局逻辑、关键交互与样式契约。
## Requirements
### Requirement: 路由表

前端 MUST 实现与现有等价的路由（vue-router 4）：
- `/`（首页）、`/blog`（列表）、`/blog/:slug`（详情）、`/animes`（列表）、`/about`（关于）：公开。
- `/admin`、`/admin/posts`、`/admin/posts/create`、`/admin/posts/:id`、`/admin/animes`：需登录，使用 AdminLayout。
- `/login` MUST 重定向到 `/`（复刻现有 `redirect-login` 全局中间件行为）。

#### Scenario: 访问 login 重定向
- **WHEN** 访问 /login
- **THEN** 重定向到 /

#### Scenario: 后台路由布局
- **WHEN** 访问 /admin/posts
- **THEN** 使用 AdminLayout 渲染

### Requirement: DefaultLayout 行为

顶部导航栏 MUST 实现：
- 滚动 > 50px 时切换为「毛玻璃实色 + 阴影 + py-2」，否则透明 + py-4（透明态判断依赖路由白名单 `['/', '/blog', '/about', '/animes']` 与 colorMode）。
- 深浅色切换按钮（基于 colorMode）。
- 移动端汉堡菜单（展开时 `slide-top` 动效）。
- 桌面端导航项：首页/博客/番剧/关于/后台，带 hover 缩放与 active 样式。

#### Scenario: 滚动变色
- **WHEN** 页面滚动超过 50px
- **THEN** 导航栏变为毛玻璃实色背景

#### Scenario: 首页透明态深浅色文字
- **WHEN** 首页未滚动
- **THEN** 深色模式文字为白色，浅色模式文字为深色

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

### Requirement: 首页功能

首页 `/` MUST 实现：
- 全屏 Hero：RubiksCubeBackground（three.js 3D 魔方，鼠标拖拽旋转、随深浅色切换配色、打乱/还原动画）。
- 打字机文案（延迟 800ms 启动，100ms/字）。
- 「最新文章」区块：拉取 `GET /api/posts?limit=3`，3 列卡片（封面、日期、标题、摘要）。
- 深色模式下对 hero-title / hero-subtitle / hero-button 的 `!important` 高对比覆盖。

#### Scenario: 最新文章展示
- **WHEN** 进入首页
- **THEN** 展示最多 3 篇已发布文章卡片

### Requirement: 博客列表功能

`/blog` MUST 实现：
- ParticleBackground variant="blue"。
- 拉取 `GET /api/posts?limit=100`，前端聚合标签并支持标签筛选（全部 + 各标签按钮）。
- TransitionGroup 列表动画（list-move/enter/leave）。
- 空状态（该标签下无文章 + 清除筛选）。

#### Scenario: 标签筛选
- **WHEN** 点击某标签
- **THEN** 列表仅显示含该标签的文章

#### Scenario: 空状态
- **WHEN** 某标签下无文章
- **THEN** 显示空状态与「清除筛选」按钮

### Requirement: 博客详情功能

`/blog/:slug` MUST 实现：
- 拉取 `GET /api/posts/:slug`。
- markdown-it 渲染（`html:true, linkify:true, typographer:true`）。
- prose + @tailwindcss/typography 排版（含现有全部 prose-* 自定义类）。
- 阅读量、阅读时长（200 词/分钟估算）、返回链接、分享按钮、自定义选区色。

#### Scenario: Markdown 渲染
- **WHEN** 进入详情页
- **THEN** content 经 markdown-it 渲染为 HTML 并应用 prose 排版

### Requirement: 番剧列表功能

`/animes` MUST 实现：
- ParticleBackground variant="rose"。
- 时间轴 / 评分榜双视图切换（viewMode），升降序切换。
- 分页滚动加载（pageSize=24，useIntersectionObserver 监听底部触发，累加去重）。
- 按年份+季度 或 评分分组渲染，中央时间轴竖线 + 节点。
- 半星评分渲染（rating/2 算法）、封面悬停玻璃遮罩 + 感想展开动画、骨架屏。
- 排序/模式切换重置页码但不清空列表（避免闪空）。

#### Scenario: 滚动加载
- **WHEN** 滚动至底部触发区且仍有更多数据
- **THEN** page+1 拉取下一页并累加去重

#### Scenario: 视图切换重置
- **WHEN** 切换 viewMode 或 order
- **THEN** page 重置为 1，但列表不清空（等待新数据）

### Requirement: 关于页

`/about` MUST 保留静态内容：ParticleBackground variant="purple"、头像、自我介绍、社交链接（GitHub/Twitter/Email）、技术栈标签。

#### Scenario: 静态内容
- **WHEN** 访问 /about
- **THEN** 展示头像、介绍、社交链接与技术栈标签

### Requirement: 后台仪表盘

`/admin` MUST 实现：文章总数统计（拉取 `/api/admin/posts` 计数）、欢迎信息、「写文章」入口。

#### Scenario: 统计展示
- **WHEN** 进入仪表盘
- **THEN** 展示总文章数（含草稿）与欢迎信息

### Requirement: 文章管理 CRUD

`/admin/posts` MUST 实现：表格（标题/状态徽标/发布时间/编辑删除）、删除二次确认、新建跳转。
新建/编辑页复用 PostForm：标题、slug（由标题正则自动生成）、摘要、Markdown 内容、封面 URL、标签（逗号分隔 ↔ JSON）、立即发布勾选。

#### Scenario: slug 自动生成
- **WHEN** 新建文章输入标题（非编辑态）
- **THEN** slug 自动由标题转 kebab-case 生成

#### Scenario: 标签 JSON 互转
- **WHEN** 表单提交
- **THEN** 逗号分隔的 tags 被序列化为 JSON 字符串提交

### Requirement: 番剧管理 CRUD

`/admin/animes` MUST 实现：
- 工具栏：搜索（300ms 防抖）、排序方式 Select（上映时间/评分/创建时间）、升降序切换。
- 表格：封面+标题+感想预览 / 评分 / 上映时间徽标 / 编辑删除。
- **函数式弹窗 CRUD**：useDialogOpen(AnimeDialog, { isEdit, initialData, onConfirm })，配 toast。
- 分页（上一页/下一页 + 总页数），查询参数同步到 URL（page/search/sortBy/order），支持浏览器前进后退。
- AnimeForm：评分 Rating、年份/季度 Select、感想；**新建时用 localStorage 缓存上次年份/季度**。

#### Scenario: URL 同步
- **WHEN** 翻页或改排序
- **THEN** page/search/sortBy/order 同步到 URL query

#### Scenario: 浏览器前进后退
- **WHEN** 按浏览器后退
- **THEN** 列表状态从 URL query 恢复

#### Scenario: 新建缓存
- **WHEN** 新建番剧选择年份/季度并保存
- **THEN** 下次新建时默认填充上次选择

### Requirement: 函数式弹窗去耦合

`useDialogOpen` MUST 去除对 `useNuxtApp()` 的依赖，改为注入 Vite 应用实例的 `_context`。
组件 API（`modelValue` / `confirm` / `cancel` / Promise resolve/reject / destroy）MUST 保持一致，使 AnimeDialog 等业务弹窗零改动。

#### Scenario: 弹窗函数式调用
- **WHEN** 调用 useDialogOpen(AnimeDialog, { onConfirm })
- **THEN** 弹窗挂载、确认时触发 onConfirm 并 resolve、取消时 reject

### Requirement: HTTP 与鉴权层

前端 MUST：
- 用 axios 实例 + 请求拦截器自动在 `Authorization` 头携带 JWT（来自 Pinia auth store）。
- 响应拦截器在 401 时清除登录态并触发后台重新弹登录框（或跳首页）。
- 登录成功后保存 `{ user, token }` 到 auth store。

#### Scenario: 自动携带 token
- **WHEN** 已登录用户发起请求
- **THEN** 请求头自动带上 Authorization: Bearer <token>

#### Scenario: 401 处理
- **WHEN** 请求返回 401
- **THEN** 清除登录态并引导重新登录

### Requirement: 页面与布局过渡动画

MUST 复刻现有 Nuxt 的 pageTransition / layoutTransition：opacity 0.4s cubic-bezier(0.4,0,0.2,1)，离开页绝对定位避免白闪。

#### Scenario: 页面切换
- **WHEN** 路由切换
- **THEN** 旧页淡出（绝对定位）与新页淡入叠加，无白屏闪烁

### Requirement: 前端工程地基就绪

`frontend/` MUST 存在可运行的 Vite + Vue 3 + TS 工程，具备：
- Tailwind v4 token 体系（`@theme` 映射 HSL 变量，`bg-background`/`text-foreground` 等类名生效，深浅色两套数值沿用现有）。
- 迁移全套 Shadcn-vue UI 组件 + lib/utils。
- vue-router 4、Pinia、axios（dev proxy → backend:3000/api）。
- 深浅色 composable（class 切换 + localStorage）。
- useDialogOpen 去耦合（注入 Vite app context）。
- RubiksCubeBackground、ParticleBackground 特效组件迁移。

满足现有 `frontend` 与 `architecture` spec 的地基场景。

#### Scenario: 工程启动
- **WHEN** 执行 npm run dev
- **THEN** Vite 在 5173 监听，/api 请求代理到后端 3000

#### Scenario: token 体系生效
- **WHEN** 渲染任一使用 bg-background 的元素
- **THEN** 深浅色切换时背景色随 token 变化，视觉与现有 Nuxt 版一致

### Requirement: 前端鉴权层就绪

`frontend/` MUST 实现完整鉴权层：
- LoginDialog 使用 authStore.login，登录成功关闭弹窗。
- AdminLayout：侧边栏导航 + 顶栏；未登录显示骨架屏 + 强制 LoginDialog（preventClose）；登录后渲染内容。
- 退出登录调用 logout 接口 + 清登录态 + 跳首页。
- RouterLink 注册 NuxtLink 别名。

满足现有 `frontend` spec 的 AdminLayout 与 HTTP/鉴权场景。

#### Scenario: 未登录访问后台
- **WHEN** 未登录访问 /admin/**
- **THEN** 显示骨架屏并弹出不可关闭的登录弹窗，登录成功后渲染内容

### Requirement: 前台公开页面就绪

`frontend/` MUST 实现全部前台页面，满足现有 `frontend` spec 的前台场景：
- DefaultLayout（滚动变色导航/透明态/移动端菜单/深浅色/页脚）。
- 首页（3D 魔方 + 打字机 + 最新文章）、博客列表（标签筛选 + 动画）、博客详情（markdown + prose）、番剧列表（时间轴/评分/滚动加载/半星）、关于（静态）。

#### Scenario: 前台页面可访问
- **WHEN** 访问 /、/blog、/blog/:slug、/animes、/about
- **THEN** 页面渲染，视觉与交互与现有 Nuxt 版一致

### Requirement: 后台页面就绪

`frontend/` MUST 实现全部后台页面，满足现有 `frontend` spec 的后台场景：
- 仪表盘（统计 + 写文章入口）、文章管理（表格 + 删除二次确认）、新建/编辑（PostForm）、番剧管理（搜索/排序/分页/URL 同步/函数式弹窗 CRUD/toast/缓存）。

#### Scenario: 后台页面可访问
- **WHEN** 登录后访问 /admin、/admin/posts、/admin/animes 等
- **THEN** 页面渲染，CRUD 与交互与现有 Nuxt 版一致

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

