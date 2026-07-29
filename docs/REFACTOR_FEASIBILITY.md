# 前后端分离重构 —— 可行性分析报告

> 本文档面向「将现有 Nuxt 4 单体全栈博客重构为前后端分离架构（前端 Vue3 + TS + Tailwind v4，后端 NestJS + Prisma + MySQL，代码同库存放于 `frontend/` 与 `backend/`）」这一目标，完成以下两项核心梳理：
> 1. **现有数据结构与前端路由 / API 接口的完整整理**；
> 2. **数据库从 SQLite 迁移至 MySQL 的方案分析**。
>
> 并在最后给出可行性结论。配套的落地实施细节见同目录《REFACTOR_PLAN.md》。

---

## 一、项目现状总览

| 维度 | 现状 |
| :--- | :--- |
| 架构 | Nuxt 4 单体全栈（SSR 前端 + Nitro 后端同进程） |
| 前端 | Vue 3.5 + `<script setup lang="ts">` + Tailwind CSS v3 + Shadcn-vue（reka-ui / radix-vue） |
| 后端 | Nitro（Nuxt 内置），基于文件系统的 `server/api/**` 路由 |
| 数据库 | SQLite（单文件 `sqlite.db`，libSQL 客户端） |
| ORM | Drizzle ORM（`server/database/schema.ts` + 迁移文件） |
| 鉴权 | `nuxt-auth-utils`，基于 Cookie 的服务端 Session（`requireUserSession` / `setUserSession`） |
| 密码 | bcryptjs（10 轮哈希） |
| 三方特效 | three.js（3D 魔方背景）、@tweenjs/tween.js、Canvas 粒子背景、@vueuse/motion、markdown-it |
| 设计变量 | `app/assets/css/main.css` 中以 HSL CSS 变量定义浅色 / 深色两套语义色 |

业务模块共三类：**用户（管理员）**、**博客文章（Posts）**、**番剧记录（Animes）**。

---

## 二、数据结构完整梳理

现有数据库共 **3 张表**，定义于 `server/database/schema.ts`，迁移文件为 `server/database/migrations/0000_luxuriant_exodus.sql`。SQLite 中时间统一以 **Unix epoch 秒（integer）** 存储。

### 2.1 `users`（管理员）

| 字段 | SQLite 类型 | Drizzle 定义 | 约束 / 默认 | 语义 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | `integer().primaryKey({ autoIncrement: true })` | 主键自增 | 用户 ID |
| `username` | `text` | `text().notNull().unique()` | 非空、唯一索引 | 登录名 |
| `password` | `text` | `text().notNull()` | 非空 | bcrypt 哈希（10 轮） |
| `name` | `text` | `text()` | 可空 | 昵称 |
| `avatar` | `text` | `text()` | 可空 | 头像 URL |
| `created_at` | `integer` | `integer({ mode: 'timestamp' }).default(sql\`(strftime('%s','now'))\`)` | 默认当前时间 | 创建时间（秒级时间戳） |

唯一索引：`users_username_unique` ON (`username`)。

> 业务特性：当表中无任何用户且登录用户名为 `admin` 时，会**自动创建首位管理员**（见 `server/api/auth/login.post.ts`）。

### 2.2 `posts`（博客文章）

| 字段 | SQLite 类型 | Drizzle 定义 | 约束 / 默认 | 语义 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | `integer().primaryKey({ autoIncrement: true })` | 主键自增 | 文章 ID |
| `title` | `text` | `text().notNull()` | 非空 | 标题 |
| `slug` | `text` | `text().notNull().unique()` | 非空、唯一 | URL 别名 |
| `content` | `text` | `text().notNull()` | 非空 | Markdown 原文 |
| `excerpt` | `text` | `text()` | 可空 | 摘要 |
| `cover_image` | `text` | `text()` | 可空 | 封面图 URL |
| `tags` | `text` | `text({ mode: 'json' }).$type<string[]>()` | 可空 | **JSON 字符串数组** |
| `is_published` | `integer` | `integer({ mode: 'boolean' }).default(false)` | 默认 false | 是否发布 |
| `view_count` | `integer` | `integer().default(0)` | 默认 0 | 阅读量 |
| `published_at` | `integer` | `integer({ mode: 'timestamp' })` | 可空 | 发布时间 |
| `created_at` | `integer` | `integer({ mode: 'timestamp' }).default(now)` | 默认当前时间 | 创建时间 |
| `updated_at` | `integer` | `integer({ mode: 'timestamp' }).default(now)` | 默认当前时间 | 更新时间 |

唯一索引：`posts_slug_unique` ON (`slug`)。

> 注意点：
> - `tags` 在 ORM 层标记为 `json` 模式，但**底层 SQLite 仍以 text 存储**。前端列表页（`blog/index.vue`）与详情页（`blog/[slug].vue`）多处直接 `JSON.parse(post.tags)`，表单组件（`PostForm.vue`）提交时也 `JSON.stringify`。**这是全栈对 tags 的统一约定，迁移时必须保持「存储为 JSON 字符串」的语义不变**，否则前端解析会崩。
> - `publishedAt` 的写入逻辑（见 `admin/posts/index.post.ts`、`[id].put.ts`）：`isPublished && !publishedAt` 时设为当前时间；否则按传入值或置空。

### 2.3 `animes`（番剧记录）

| 字段 | SQLite 类型 | Drizzle 定义 | 约束 / 默认 | 语义 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | `integer().primaryKey({ autoIncrement: true })` | 主键自增 | ID |
| `title` | `text` | `text().notNull()` | 非空 | 番剧名 |
| `cover_image` | `text` | `text().notNull()` | 非空 | 封面图 URL |
| `rating` | `integer` | `integer().notNull()` | 非空 | 评分 0–10（含半分，前端按 /2 显示 5 星） |
| `review` | `text` | `text()` | 可空 | 一句话感想 |
| `release_year` | `integer` | `integer().notNull()` | 非空 | 上映年份 |
| `release_quarter` | `integer` | `integer().notNull()` | 非空 | 上映季度，取值 `{1,4,7,10}`（冬/春/夏/秋） |
| `created_at` | `integer` | `integer({ mode: 'timestamp' }).default(now)` | 默认当前时间 | 创建时间 |
| `updated_at` | `integer` | `integer({ mode: 'timestamp' }).default(now)` | 默认当前时间 | 更新时间 |

> 注意点：
> - `rating` 范围 0–10，**允许奇数（半分）**。前端 `Rating.vue` 与 `animes/index.vue` 的 `renderStars()` 都依赖「rating/2 + 取半」算法，必须保持 0–10 整数语义。
> - `release_quarter` 仅允许 1/4/7/10 四值，前端用 `getQuarterLabel` 映射为「冬/春/夏/秋」或「1/4/7/10月」，迁移后需保留同一约定。

### 2.4 表间关系

当前三张表**无外键关联**，均为独立实体。`posts.view_count` 由前端读取展示，但现有代码中**没有找到浏览量自增的接口实现**（详情接口仅读取不累加），迁移时如实保留该行为即可。

---

## 三、前端路由与页面梳理

Nuxt 采用**基于文件系统的路由**，页面位于 `app/pages/**`，布局位于 `app/layouts/**`，中间件位于 `app/middleware/**`。

### 3.1 路由总表

| 路径 | 文件 | 布局 | 中间件 | 鉴权 | 说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `pages/index.vue` | default | redirect-login(global) | 公开 | 首页 |
| `/blog` | `pages/blog/index.vue` | default | 同上 | 公开 | 博客列表 |
| `/blog/:slug` | `pages/blog/[slug].vue` | default | 同上 | 公开 | 文章详情 |
| `/animes` | `pages/animes/index.vue` | default | 同上 | 公开 | 番剧列表 |
| `/about` | `pages/about.vue` | default | 同上 | 公开 | 关于 |
| `/login` | — | — | redirect-login(global) | — | **被重定向到 `/`** |
| `/admin` | `pages/admin/index.vue` | admin | auth | 需登录 | 仪表盘 |
| `/admin/posts` | `pages/admin/posts/index.vue` | admin | auth | 需登录 | 文章管理 |
| `/admin/posts/create` | `pages/admin/posts/create.vue` | admin | auth | 需登录 | 新建文章 |
| `/admin/posts/:id` | `pages/admin/posts/[id].vue` | admin | auth | 需登录 | 编辑文章 |
| `/admin/animes` | `pages/admin/animes/index.vue` | admin | auth | 需登录 | 番剧管理 |

### 3.2 布局

- **`layouts/default.vue`（前台）**：固定/透明自适应导航栏（滚动 > 50px 变毛玻璃实色）、深浅色切换、移动端汉堡菜单（`v-motion-slide-top`）、页脚。透明态判断逻辑依赖路由白名单 `['/', '/blog', '/about', '/animes']` 与 `colorMode`。
- **`layouts/admin.vue`（后台）**：左侧 64 宽侧边栏 + 顶栏，未登录时显示骨架屏并强制弹出 `LoginDialog`（`preventClose`）。登录状态读取自 `useUserSession()` 的 `loggedIn`。

### 3.3 中间件

- `redirect-login.global.ts`（全局）：访问 `/login` 一律重定向到 `/`（登录改由后台 layout 内的弹窗完成）。
- `auth.ts`（命名，挂于后台页）：当前为占位，实际鉴权交由后台 layout 的 `loggedIn` 判断与登录弹窗。

### 3.4 各页面功能要点（迁移须逐一对照）

#### 首页 `/`
- 全屏 Hero：`RubiksCubeBackground`（three.js 3D 魔方，支持鼠标拖拽旋转、随深浅色切换配色、打乱/还原动画）。
- 打字机文案（800ms 延迟启动，100ms/字）。
- 「最新文章」区块：`useFetch('/api/posts', { query: { limit: 3 } })`，3 列卡片。
- 深色模式下对标题/副标题/按钮的 `!important` 高对比覆盖样式。

#### 博客列表 `/blog`
- `ParticleBackground variant="blue"`。
- `useFetch('/api/posts', { query: { limit: 100 } })`，一次性拉取后在**前端**做标签聚合与筛选。
- 标签筛选按钮 + `TransitionGroup` 列表动画（`list-move/enter/leave`）。
- 空状态、日期徽标、`line-clamp`、悬停位移。

#### 博客详情 `/blog/:slug`
- `useFetch('/api/posts/:slug')`。
- `markdown-it` 渲染（`html:true, linkify:true, typographer:true`）。
- `prose` + `@tailwindcss/typography` 排版（含大量 `prose-*` 自定义类）。
- 阅读量、阅读时长（200 词/分钟估算）、返回链接、分享按钮、自定义选区色。

#### 番剧列表 `/animes`
- `ParticleBackground variant="rose"`。
- 时间轴 / 评分榜双视图切换（`viewMode`），升降序切换。
- 分页滚动加载（`pageSize=24`，`useIntersectionObserver` 监听底部触发，累加去重）。
- 按年份+季度或评分**分组渲染**，中央时间轴竖线 + 节点。
- 半星评分渲染、封面悬停玻璃遮罩 + 感想展开动画、骨架屏。
- 排序/模式切换重置页码但不清空列表（避免闪空）。

#### 关于 `/about`
- `ParticleBackground variant="purple"`。
- 头像、自我介绍、社交链接（GitHub/Twitter/Email）、技术栈标签。静态内容。

#### 后台仪表盘 `/admin`
- 文章总数统计、欢迎信息、「写文章」入口。
- `useFetch('/api/admin/posts')`（含草稿）。

#### 文章管理 `/admin/posts`
- 表格列：标题 / 状态（已发布/草稿 badge）/ 发布时间 / 操作（编辑、删除）。
- 删除二次确认（`confirm`），删除后 `refresh()`。
- 「新建文章」跳 `/admin/posts/create`。

#### 新建/编辑文章 `/admin/posts/create`、`/admin/posts/:id`
- 复用 `PostForm.vue`：标题、slug（由标题自动生成正则 slug）、摘要、Markdown 内容、封面 URL、标签（逗号分隔 ↔ JSON）、立即发布勾选。
- 编辑态回填 `initialData`，提交后 `navigateTo('/admin/posts')`。

#### 番剧管理 `/admin/animes`
- 工具栏：搜索（300ms 防抖）、排序方式 Select（上映时间/评分/创建时间）、升降序切换。
- 表格：封面+标题+感想预览 / 评分 / 上映时间 badge / 编辑删除。
- **函数式弹窗 CRUD**：`useDialogOpen(AnimeDialog, { isEdit, initialData, onConfirm })`，配合 toast。
- 分页（上一页/下一页 + 总页数），查询参数同步到 URL（`page/search/sortBy/order`），支持浏览器前进后退。
- `AnimeForm.vue`：评分 Rating、年份/季度 Select、感想；**新建时用 localStorage 缓存上次年份/季度**。

### 3.5 关键交互组件清单（迁移时需重点保留）

| 组件 | 作用 | 迁移关注点 |
| :--- | :--- | :--- |
| `RubiksCubeBackground.vue` | three.js 3D 魔方 | three + tween 依赖、深浅色配色、OrbitControls |
| `ParticleBackground.vue` | Canvas 粒子 + 渐变背景 | 5 种颜色变体、深浅色交叉淡入、鼠标连线 |
| `LoginDialog.vue` | 登录弹窗 | radix-vue 原语、preventClose、登录后刷新会话 |
| `ui/rating/Rating.vue` | 半星评分 | 0–10 整数、左右半分点击算法 |
| `lib/useDialogOpen.ts` | 函数式弹窗 | 依赖 `useNuxtApp().vueApp._context`，**迁移到纯 Vue 需改写上下文获取** |
| `ui/**` | Shadcn-vue 组件集 | 全套可直接复用到 Vite 工程 |

---

## 四、API 接口完整梳理

所有接口位于 `server/api/**`，按文件系统映射。管理接口统一以 `requireUserSession(event)` 守卫。

### 4.1 认证

| 方法 | 路径 | 鉴权 | 入参 | 出参 | 业务逻辑 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | 否 | `{ username, password }` | `{ user: { id, username, name } }` | 校验；表空且 username=`admin` 时自动建号；`setUserSession` |
| POST | `/api/auth/logout` | 否 | — | `{ success: true }` | `clearUserSession` |

> 当前**无** `/api/auth/me`（前端通过 `useUserSession()` 读 cookie session）。分离后端后需补一个 `GET /auth/me` 供前端拉取登录态。

### 4.2 公开内容接口

| 方法 | 路径 | 入参（query） | 出参 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/posts` | `page`(默认1), `limit`(默认10) | `Post[]`（仅 `isPublished=true`，按 `publishedAt` 降序） | 注意返回的是**数组**而非分页对象 |
| GET | `/api/posts/:slug` | path: `slug` | `Post` | 仅返回已发布；未找到 404 |
| GET | `/api/animes` | `page`(1), `pageSize`(12, 上限100), `sortBy`(`releaseDate`/`rating`, 默认 releaseDate), `order`(`desc`/`asc`) | `{ items, total, page, pageSize, totalPages }` | releaseDate 排序按 year 再 quarter；默认按 createdAt |

### 4.3 管理接口（均需登录）

文章：

| 方法 | 路径 | 入参 | 出参 |
| :--- | :--- | :--- | :--- |
| GET | `/api/admin/posts` | — | `Post[]`（含草稿，按 createdAt 降序） |
| POST | `/api/admin/posts` | body: `{ title, slug, content, excerpt?, coverImage?, tags?, isPublished?, publishedAt? }` | 新建的 `Post` |
| GET | `/api/admin/posts/:id` | path: `id` | `Post` |
| PUT | `/api/admin/posts/:id` | 同 POST body | 更新后的 `Post` |
| DELETE | `/api/admin/posts/:id` | path: `id` | `{ success: true }` |

番剧：

| 方法 | 路径 | 入参 | 出参 |
| :--- | :--- | :--- | :--- |
| GET | `/api/admin/animes` | `page`(1), `pageSize`(10, 上限100), `search`, `sortBy`(`releaseDate`/`rating`/`createdAt`), `order` | `{ items, total, page, pageSize, totalPages }` |
| POST | `/api/admin/animes` | `{ title, coverImage, rating, review?, releaseYear, releaseQuarter }` | 新建的 `Anime` |
| GET | `/api/admin/animes/:id` | path: `id` | `Anime` |
| PUT | `/api/admin/animes/:id` | 同 POST body | 更新后的 `Anime` |
| DELETE | `/api/admin/animes/:id` | path: `id` | `{ success: true }` |

### 4.4 接口语义保留要点

1. **`GET /api/posts` 返回裸数组**，而 `GET /api/animes` 返回分页对象——两个不一致的返回结构，前端已分别适配，迁移后端时**必须原样保持**，否则需同步改前端。
2. `publishedAt` 写入规则（见 2.2）需在后端服务层复刻。
3. 排序默认值：公开 animes 默认 `sortBy=releaseDate`、`order=desc`；管理 animes 默认同。
4. 错误码：参数缺失 400，未授权/凭据错误 401，未找到 404。

---

## 五、数据库迁移可行性分析（SQLite → MySQL）

现有数据为种子数据规模（`seed-animes.ts` 仅 4 条番剧；文章/用户为实际使用中产生，量级很小），**迁移本身低风险**，真正需要关注的是「类型映射 / 时间格式 / JSON 语义」三类系统性差异。

### 5.1 SQLite 与 MySQL 的关键差异

| 维度 | SQLite 现状 | MySQL 目标 | 影响 / 处理 |
| :--- | :--- | :--- | :--- |
| 时间存储 | integer（epoch 秒） | `DATETIME(3)` 或 `TIMESTAMP` | **最大差异点**：需把秒级整数换算成日期时间 |
| 布尔 | integer 0/1 | `TINYINT(1)` / Prisma `Boolean` | 语义一致，无风险 |
| 自增 | `AUTOINCREMENT` | `AUTO_INCREMENT` | 由 Prisma `@default(autoincrement())` 接管 |
| JSON | text 存 JSON 字符串 | `JSON` 原生类型 / 或继续用 `LONGTEXT` | 见 5.4，建议**保持 text 语义**以兼容前端 |
| 字符集 | UTF-8（默认） | 需显式 `utf8mb4` | 必须用 `utf8mb4` 以支持 emoji / 中文 |
| 大小写 | 默认大小写敏感不一 | `utf8mb4_general_ci` 默认不敏感 | 影响 `username` 唯一性；可加 `BINARY` 或 collation 控制 |
| 主键类型 | integer | int 或可换为 bigint | 保留 int 即可 |

### 5.2 时间戳迁移（最关键）

现有 `created_at / updated_at / published_at` 均为 **epoch 秒**。Drizzle 的 `mode: 'timestamp'` 在读取时会 `new Date(value * 1000)` 转成 JS Date。

迁移策略：

- MySQL 侧用 `DATETIME(3)`（毫秒精度，避免时区歧义）或 `TIMESTAMP`（随会话时区转换）。**推荐 `DATETIME(3)`**，与应用层约定 UTC 存储。
- 导出时把整数 `× 1000` 转 ISO 字符串写入；或编写一次性脚本：`SELECT id, created_at, ...` → `FROM_UNIXTIME(created_at)`。
- NestJS 服务层对外统一序列化为 ISO 8601 字符串；前端现有 `new Date(post.publishedAt)` 在 Nuxt SSR 下接收的已是 Date/ISO，**行为一致**。

> 风险点：SQLite 中 `published_at` 可能为 `null`；前端 `blog/index.vue`、`[slug].vue` 对 `publishedAt` 有非空断言 `!`，迁移后若字段为 null 需保证前端兼容（当前代码假设已发布文章必有 publishedAt，迁移后维持该不变式即可）。

### 5.3 `tags` 字段（JSON）迁移

- 现状：text 列存 `["Vue","Nuxt"]` 形式字符串，前端 `JSON.parse`。
- 两种选择：
  1. **MySQL 用原生 `JSON` 类型**（Prisma `Json`）——查询能力强，但 Prisma 读出为对象/数组，**与前端现有 `JSON.parse(string)` 直接冲突**，需同步改前端。
  2. **MySQL 用 `LONGTEXT`/`VARCHAR` 继续存 JSON 字符串**（Prisma `String`）——**零前端改动**，保持现有全栈契约。
- **结论：采用方案 2**，以「最小改动、最大功能一致性」为优先；后续如需按标签查询再迁移。

### 5.4 唯一约束与大小写

- `users.username`、`posts.slug` 的唯一索引在 MySQL 下需明确 collation。建议 `utf8mb4_bin`（大小写敏感）以与 SQLite 行为对齐，避免 `Admin` 与 `admin` 被判重。

### 5.5 `view_count`

当前无自增接口，迁移时原值搬入即可（`INTEGER DEFAULT 0`）。

### 5.6 迁移步骤（数据层面）

1. **导出**：从 `sqlite.db` 读取三张表（可用 Node + better-sqlite3/libsql，或一次性脚本）。本仓库已有 `@libsql/client` 依赖，可直接写脚本。
2. **转换**：时间字段 `× 1000 → new Date().toISOString()`；其余字段原样。
3. **写入**：通过 Prisma（`prisma.user.createMany` 等）或裸 SQL 批量插入新 MySQL 库。
4. **校验**：对比行数、抽样比对内容、时间字段前后一致性。
5. **密码**：bcrypt 哈希与数据库无关，**原样迁移即可**，NestJS 侧继续用 bcryptjs `compare` 校验，无需重置密码。

### 5.7 迁移风险与应对

| 风险 | 等级 | 应对 |
| :--- | :--- | :--- |
| 时间精度/时区错乱 | 高 | 统一 UTC 存储 + ISO 序列化；迁移脚本单测 |
| tags JSON 契约破坏 | 中 | 采用 text 方案保持原语义 |
| 大小写敏感导致唯一冲突 | 中 | username/slug 用 `utf8mb4_bin` |
| 首次 admin 自动建号逻辑遗漏 | 中 | 在 NestJS 登录服务中复刻同逻辑 |
| 分页/排序默认值不一致 | 中 | 严格对照 4.2/4.3 默认值 |
| 深浅色/动画等纯前端特性 | 低 | 与 DB 无关，逐组件迁移验收 |

---

## 六、可行性结论

**结论：可行，且整体低风险。** 理由：

1. **业务边界清晰**：3 张独立表、17 个接口、11 条路由，无复杂关联与事务，迁移映射关系一目了然。
2. **前端可高度复用**：Shadcn-vue 组件、Tailwind 类、three.js/Canvas 背景组件均与 Nuxt 无强耦合，迁到 Vite + Vue3 工程改动集中在「路由（vue-router）、深浅色（替代 @nuxtjs/color-mode）、数据获取（fetch 封装 + JWT 拦截）、函数式弹窗上下文（useDialogOpen 脱离 useNuxtApp）」。
3. **数据量小**：种子规模，迁移脚本一次性即可完成，且密码哈希可直接复用。
4. **Token 体系现成**：`main.css` 已用 HSL 语义变量，迁到 Tailwind v4 只需在 `@theme` 中做一层映射即可保持页面样式零变化。
5. **需重点投入的「破坏性变更」可控**，集中在以下几点（实施时须逐条对照）：
   - 鉴权从 **Cookie Session** 改为 **JWT**（前后端分离的常规做法），前端需新增 token 存储与请求拦截、401 跳登录；
   - 补充 `GET /auth/me` 接口；
   - `useDialogOpen` 去除 `useNuxtApp()` 依赖，改用应用全局上下文；
   - `useFetch` / `useUserSession` 等 Nuxt 自动导出需替换为显式封装；
   - `<NuxtLink>` → `<RouterLink>`、`navigateTo` → `router.push`、`definePageMeta` → 路由 meta；
   - 页面/布局过渡动画需用 vue-router 的 transition 手动实现。

落地实施细节（目录结构、Prisma schema、Tailwind v4 token、分阶段步骤、验收清单）见同目录 **《REFACTOR_PLAN.md》**。
