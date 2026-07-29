# 前后端分离重构 —— 落地实施方案

> 配套文档：《REFACTOR_FEASIBILITY.md》（可行性分析、数据结构与路由接口梳理、数据库迁移分析）。
> 本文档在可行性结论成立的前提下，给出**可直接执行的实施方案**：仓库结构、后端 NestJS + Prisma 设计、前端 Vue3 + TS + Tailwind v4 设计（含 Token 体系）、数据库迁移步骤、分阶段推进计划与验收清单。
>
> 总原则：**同仓 monorepo、功能 1:1 对齐、样式零变化、分阶段可验收**。

---

## 一、目标架构总览

```
yustiLot-blog/                       # 单一 Git 仓库
├── frontend/                        # 前端：Vite + Vue3 + TS + Tailwind v4
├── backend/                         # 后端：NestJS + Prisma + MySQL
├── docs/                            # 文档（保留现有，新增迁移文档）
├── scripts/                         # 一次性迁移脚本（SQLite → MySQL）
├── AGENTS.md                        # 开发准则（保留）
└── README.md
```

- **前端**：独立 Vite SPA，通过 HTTP 调用后端。开发期 Vite proxy 转发 `/api` 到 NestJS；生产期由 Nginx 静态托管前端 + 反代后端。
- **后端**：NestJS 提供 REST API（统一前缀 `/api` 以兼容现有前端调用路径），Prisma 管理 MySQL。
- **鉴权**：由 Nuxt 的 Cookie Session 改为 **JWT（access token）**，token 存 localStorage 并由 axios/fetch 拦截器自动携带、401 时跳登录。

---

## 二、后端设计（backend/）

### 2.1 技术栈

| 项 | 选型 | 说明 |
| :--- | :--- | :--- |
| 框架 | NestJS | 模块化、装饰器风格、内置 DI 与守卫 |
| ORM | Prisma | 替换 Drizzle，类型生成完善，MySQL 支持成熟 |
| 数据库 | MySQL 8.x | `utf8mb4` |
| 鉴权 | `@nestjs/jwt` + `bcryptjs` | bcrypt 哈希沿用，无需重置密码 |
| 校验 | `class-validator` + `class-transformer` | DTO 校验 |
| 配置 | `@nestjs/config` | `.env` 管理 |
| 文档 | `@nestjs/swagger`（可选） | 接口文档 |

### 2.2 目录结构

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                       # 番剧种子（对应 seed-animes.ts）
│   └── migrations/
├── src/
│   ├── main.ts                       # 启用 CORS、全局 ValidationPipe、统一 /api 前缀
│   ├── app.module.ts
│   ├── common/                       # 通用：过滤器、拦截器、装饰器
│   │   ├── filters/all-exception.filter.ts
│   │   ├── interceptors/transform.interceptor.ts   # 统一响应体（可选）
│   │   └── guards/jwt-auth.guard.ts
│   ├── modules/
│   │   ├── auth/                     # 登录/登出/me
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/login.dto.ts
│   │   │   ├── strategies/jwt.strategy.ts
│   │   │   └── auth.module.ts
│   │   ├── posts/                    # 公开 + 管理文章
│   │   │   ├── posts.controller.ts   # /api/posts、/api/posts/:slug
│   │   │   ├── posts.admin.controller.ts  # /api/admin/posts/**（带 @UseGuards(Jwt)）
│   │   │   ├── posts.service.ts
│   │   │   └── dto/{create,update}-post.dto.ts
│   │   ├── animes/                   # 公开 + 管理番剧
│   │   │   ├── animes.controller.ts
│   │   │   ├── animes.admin.controller.ts
│   │   │   ├── animes.service.ts
│   │   │   └── dto/{create,update}-anime.dto.ts
│   │   └── prisma/prisma.module.ts   # 全局 PrismaClient provider
│   └── utils/
│       └── password.util.ts          # bcrypt 封装（hash/compare）
├── test/
├── .env                              # DATABASE_URL、JWT_SECRET、CORS_ORIGIN
├── package.json
└── tsconfig.json
```

### 2.3 Prisma Schema（与现有字段 1:1 对齐）

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique @db.VarChar(64)   // 大小写敏感见 2.4
  password  String                                 // bcrypt 哈希
  name      String?  @db.VarChar(64)
  avatar    String?  @db.VarChar(512)
  createdAt DateTime @default(now()) @map("created_at") @db.DateTime(3)
  @@map("users")
}

model Post {
  id          Int       @id @default(autoincrement())
  title       String    @db.VarChar(255)
  slug        String    @unique @db.VarChar(255)
  content     String    @db.LongText
  excerpt     String?   @db.VarChar(500)
  coverImage  String?   @db.VarChar(512) @map("cover_image")
  // 保持「JSON 字符串」语义，前端 JSON.parse 不变
  tags        String?   @db.LongText
  isPublished Boolean   @default(false) @map("is_published") @db.TinyInt
  viewCount   Int       @default(0) @map("view_count")
  publishedAt DateTime? @map("published_at") @db.DateTime(3)
  createdAt   DateTime  @default(now()) @map("created_at") @db.DateTime(3)
  updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at") @db.DateTime(3)
  @@map("posts")
}

model Anime {
  id             Int      @id @default(autoincrement())
  title          String   @db.VarChar(255)
  coverImage     String   @db.VarChar(512) @map("cover_image")
  rating         Int                                            // 0-10，可奇数
  review         String?  @db.VarChar(500)
  releaseYear    Int      @map("release_year")
  releaseQuarter Int      @map("release_quarter")                 // {1,4,7,10}
  createdAt      DateTime @default(now()) @map("created_at") @db.DateTime(3)
  updatedAt      DateTime @default(now()) @updatedAt @map("updated_at") @db.DateTime(3)
  @@map("animes")
}
```

> 字段映射与命名（`@@map` / `@map`）保持现有 snake_case 列名，便于与迁移脚本对齐。时间精度统一 `DateTime(3)`，UTC 存储。

### 2.4 大小写敏感与字符集

建库 SQL：

```sql
CREATE DATABASE IF NOT EXISTS yustilot_blog
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_bin;          -- 大小写敏感，对齐 SQLite 行为
```

> `utf8mb4_bin` 对全库生效，可保证 `users.username`、`posts.slug` 唯一约束的大小写敏感性与 SQLite 一致。

### 2.5 接口契约（与现有 1:1）

路由前缀统一 `/api`，**路径、入参、出参结构与现有完全一致**（详见可行性文档第四章）。控制器示意：

```ts
// posts.controller.ts（公开）
@Controller('posts')
export class PostsController {
  @Get()
  list(@Query('page') page = 1, @Query('limit') limit = 10) { /* 返回 Post[] */ }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) { /* 仅返回 isPublished，否则 404 */ }
}

// posts.admin.controller.ts（管理）
@Controller('admin/posts')
@UseGuards(JwtAuthGuard)
export class PostsAdminController {
  @Get() all() {}
  @Post() create(@Body() dto: CreatePostDto) {}
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) {}
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {}
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {}
}
```

关键业务规则复刻：

1. **`publishedAt` 写入**（Create/Update）：`isPublished && !publishedAt` → `new Date()`；`publishedAt` 有值 → `new Date(publishedAt)`；否则 `null`。
2. **首次 admin 自动建号**（登录服务）：`users` 表为空且 `username === 'admin'` 时，创建 `name='Admin'` 用户后直接签发 JWT 返回。
3. **`GET /api/posts`** 仅返回 `isPublished=true`，按 `publishedAt DESC`，返回**裸数组**。
4. **`GET /api/animes`** 默认 `sortBy=releaseDate`（按 year 再 quarter 排序）、`order=desc`；`pageSize` 默认 12、上限 100；返回分页对象 `{ items, total, page, pageSize, totalPages }`。
5. **`GET /api/admin/animes`** 默认 `pageSize=10`，支持 `search`（title LIKE）、`sortBy ∈ {releaseDate, rating, createdAt}`。
6. **新增 `GET /api/auth/me`**：返回当前 JWT 用户信息，供前端初始化登录态。

### 2.6 鉴权方案

- 登录成功签发 `access_token`（payload: `{ sub, username, name }`），有效期建议 7 天（可配置）。
- `JwtAuthGuard` 全局或按控制器挂载；`/api/auth/login`、`/api/posts`、`/api/posts/:slug`、`/api/animes` 公开。
- 401 统一返回 `{ statusCode: 401, message: 'Unauthorized' }`，前端拦截器据此清 token + 跳登录。
- `bcrypt` 复用：`bcrypt.compare(input, user.password)`，与现有哈希兼容。

### 2.7 统一异常 → HTTP 状态

| 场景 | 状态码 | 对齐现有 |
| :--- | :--- | :--- |
| DTO 校验失败 | 400 | 对齐 `Missing credentials` |
| 凭据错误 / 未登录 | 401 | 对齐 `Invalid credentials` |
| 资源不存在 | 404 | 对齐 `Post/Anime not found` |

---

## 三、数据库迁移步骤（SQLite → MySQL）

> 详见可行性文档第五章分析。此处给出可执行步骤。

### 3.1 准备

1. 本地起 MySQL 8，按 2.4 建库。
2. `cd backend && npx prisma migrate dev --name init` 生成初始 schema。
3. 在 `scripts/` 新建迁移脚本 `migrate-sqlite-to-mysql.ts`，依赖 `@libsql/client`（仓库已有）+ `@prisma/client`。

### 3.2 迁移脚本逻辑

```ts
// scripts/migrate-sqlite-to-mysql.ts（伪代码）
import { createClient } from '@libsql/client'
import { PrismaClient } from '@prisma/client'

const sqlite = createClient({ url: 'file:../sqlite.db' })
const prisma = new PrismaClient()

async function run() {
  // users：时间 epoch 秒 → Date
  for (const u of await sqlite.execute('SELECT * FROM users')) {
    await prisma.user.create({
      data: {
        id: u.id, username: u.username, password: u.password,
        name: u.name, avatar: u.avatar,
        createdAt: new Date((u.created_at as number) * 1000),
      }
    })
  }
  // posts：tags 原样字符串搬运；时间换算
  // animes：字段一一映射
  // 最后对齐 AUTO_INCREMENT 起始值（MAX(id)+1）
}
```

要点：
- **时间换算**：所有 `*_at` 字段 `value * 1000 → new Date()`。
- **tags 不做 JSON.parse**，原样字符串写入。
- **password 原样**，bcrypt 哈希与库无关。
- **自增对齐**：迁移后 `ALTER TABLE xxx AUTO_INCREMENT = (SELECT MAX(id)+1)`，避免主键冲突。

### 3.3 校验

- 行数核对：`users / posts / animes` 三表行数一致。
- 时间抽样：随机 N 条比对 `new Date(sqlite_val*1000).toISOString() === mysql_val.toISOString()`。
- tags 抽样：字符串完全相等。
- 登录验证：用原管理员密码登录新后端，成功且拿到 JWT。

### 3.4 回滚

- 迁移阶段不破坏 `sqlite.db`（只读），失败可直接重建 MySQL 库重跑；`sqlite.db` 始终是回滚兜底。

---

## 四、前端设计（frontend/）

### 4.1 技术栈

| 项 | 选型 |
| :--- | :--- |
| 构建 | Vite 6 + Vue 3.5 + TypeScript |
| 路由 | vue-router 4（替代 Nuxt 文件路由） |
| 状态 | Pinia（登录态、用户信息） |
| 请求 | axios + 拦截器（JWT、错误统一处理） |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite` 插件） |
| 组件库 | 现有 Shadcn-vue（reka-ui / radix-vue）原样搬入 |
| Markdown | markdown-it + `@tailwindcss/typography` |
| 动效 | @vueuse/core、@vueuse/motion、three、@tweenjs/tween.js |
| 深浅色 | `@vueuse/core` 的 `useColorMode` 或自实现 class 切换（替代 @nuxtjs/color-mode） |
| 图标 | lucide-vue-next |
| 提示 | vue-sonner |

### 4.2 目录结构

```
frontend/
├── public/
├── src/
│   ├── main.ts
│   ├── App.vue                       # <RouterView> + 全局过渡 + Toaster
│   ├── assets/css/main.css           # @theme token 体系（见 4.4）
│   ├── router/
│   │   ├── index.ts                  # 路由表 + 全局守卫（见 4.5）
│   │   └── transitions               # 页面/布局过渡复刻
│   ├── stores/
│   │   └── auth.ts                   # 登录态、user、token
│   ├── api/
│   │   ├── request.ts                # axios 实例 + 拦截器
│   │   ├── auth.ts / posts.ts / animes.ts
│   ├── layouts/
│   │   ├── DefaultLayout.vue         # 由 layouts/default.vue 迁移
│   │   └── AdminLayout.vue           # 由 layouts/admin.vue 迁移
│   ├── pages/                        # 逐页迁移（见 4.6）
│   ├── components/
│   │   ├── ui/                       # 现有 Shadcn-vue 原样搬入
│   │   ├── admin/
│   │   ├── RubiksCubeBackground.vue
│   │   ├── ParticleBackground.vue
│   │   └── LoginDialog.vue
│   ├── composables/
│   │   ├── useDialogOpen.ts          # 去除 useNuxtApp 依赖（见 4.7）
│   │   └── useColorMode.ts           # 深浅色
│   └── lib/utils.ts
├── index.html
├── vite.config.ts                    # 含 dev proxy → http://localhost:3000/api
├── tailwind.config.ts                # v4 可选，主体由 CSS @theme 承担
├── components.json                   # shadcn-vue 配置更新路径别名
├── tsconfig.json
└── package.json
```

### 4.3 Vite 配置（开发期代理）

```ts
// vite.config.ts
export default defineConfig({
  plugins: [vue(), tailwindcss(), motion()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true }
    }
  }
})
```

### 4.4 Tailwind v4 Token 体系（核心）

现有 `main.css` 已用 HSL 语义变量（`--background`、`--foreground`、`--primary` ...）。Tailwind v4 采用 CSS-first 配置（`@theme`），需把语义变量映射为 v4 的 token，**保证页面 Tailwind 类名（如 `bg-background`、`text-foreground`、`text-primary`）零改动**。

```css
/* src/assets/css/main.css */
@import 'tailwindcss';
@plugin '@tailwindcss/typography';

/* 深浅色根变量（沿用现有 HSL 数值，保持视觉不变） */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;            --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;         --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%; --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;   --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;       --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;      --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%; --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
.dark {
  --background: 222.2 84% 4.9%; --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;       --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;    --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%; --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%; --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;   --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%; --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}

/* 将语义变量注册为 Tailwind v4 颜色 token，
   使 bg-background / text-foreground / border-border 等类名继续生效 */
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

/* 全局基础样式（沿用现有） */
@layer base {
  * { border-color: hsl(var(--border)); }
  html { background: hsl(var(--background)); color-scheme: dark light; }
  body { background: hsl(var(--background)); color: hsl(var(--foreground)); min-height: 100vh; }
}
```

> 这样既建立了 v4 的 token 体系（`--color-*` 在 `@theme` 中），又**完全沿用原有 HSL 数值**，页面样式零变化。原 v3 配置中的 `container`、`animation: accordion-*`、`keyframes` 等少量扩展在 v4 中用 `@theme` 对应键或 CSS 自行补齐即可。

### 4.5 路由表（逐条映射 Nuxt → vue-router）

```ts
// src/router/index.ts
const routes = [
  { path: '/', component: () => import('@/pages/index.vue') },
  { path: '/blog', component: () => import('@/pages/blog/index.vue') },
  { path: '/blog/:slug', component: () => import('@/pages/blog/[slug].vue') },
  { path: '/animes', component: () => import('@/pages/animes/index.vue') },
  { path: '/about', component: () => import('@/pages/about.vue') },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('@/pages/admin/index.vue') },
      { path: 'posts', component: () => import('@/pages/admin/posts/index.vue') },
      { path: 'posts/create', component: () => import('@/pages/admin/posts/create.vue') },
      { path: 'posts/:id', component: () => import('@/pages/admin/posts/[id].vue') },
      { path: 'animes', component: () => import('@/pages/admin/animes/index.vue') },
    ]
  },
  { path: '/login', redirect: '/' },     // 复刻 redirect-login.global 行为
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.loggedIn) {
    // 不直接跳转，而是进入后台后由 AdminLayout 弹 LoginDialog（复刻现有体验）
  }
})
```

> 鉴权策略：保留现有「后台页不跳转、由 layout 弹登录框」体验——访问 `/admin/**` 时若未登录，layout 显示骨架屏 + 弹 `LoginDialog`，登录成功后渲染内容。

### 4.6 Nuxt 特有 API 替换对照表

| Nuxt 用法 | Vue3/Vite 替换 |
| :--- | :--- |
| `<NuxtLink to="x">` | `<RouterLink to="x">`（可全局注册别名 `NuxtLink`） |
| `useFetch('/api/...')` | `api.get(...)` 封装；列表页用 `ref + watch` 或 `@vueuse/core` 的 `useAsyncState` |
| `navigateTo('/x')` | `router.push('/x')` |
| `useRoute()` / `useRouter()` | `useRoute()` / `useRouter()`（vue-router） |
| `useUserSession()` | `useAuthStore()`（Pinia） |
| `useColorMode()` | 自建 `useColorMode` composable（class 切换 + localStorage） |
| `definePageMeta({ layout, middleware })` | 路由 `meta` + `children` |
| `useHead({ title })` | `@unhead/vue` 或 `@vueuse/head` |
| `v-motion-*` 指令 | `@vueuse/motion`（Vite 插件版） |
| 页面/布局过渡（`pageTransition`） | `<RouterView v-slot>` 内 `<Transition>` |

### 4.7 `useDialogOpen` 去耦合

现有实现依赖 `useNuxtApp().vueApp._context` 来挂载函数式弹窗。Vite 版改为注入应用实例：

```ts
// composables/useDialogOpen.ts
import { getApp } from '@/main'   // main.ts 中 export const getApp = () => app
// ...
const app = getApp()
vNode.appContext = app._context
```

其余 Promise/resolve/reject/destroy 逻辑不变，组件 API（`modelValue` / `confirm` / `cancel`）保持一致。

### 4.8 请求层与登录态

```ts
// api/request.ts
const request = axios.create({ baseURL: '/api', timeout: 15000 })

request.interceptors.request.use(cfg => {
  const token = useAuthStore().token
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

request.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      useAuthStore().logout()
      // 触发后台 layout 重新弹登录框（或跳首页）
    }
    return Promise.reject(err)
  }
)
```

`LoginDialog.vue` 改造：登录成功后 `authStore.setSession({ user, token })` 替代 `refreshSession()`。

---

## 五、分阶段推进计划

> 每阶段独立可验收，失败不影响旧单体继续运行（旧代码在仓库根保留至验收通过后再归档/删除）。

### 阶段 0：仓库初始化（半天）
- [ ] 在根目录建 `frontend/`、`backend/`、`scripts/` 目录。
- [ ] 更新 `.gitignore`（各子项目 `node_modules`、`dist`、`.env`）。
- [ ] 根 `package.json` 增加工作区脚本（可选 pnpm workspace）。

### 阶段 1：后端搭建与数据迁移（2–3 天）
- [ ] `backend/` 初始化 NestJS + Prisma + MySQL。
- [ ] 编写 `schema.prisma`（见 2.3），`migrate dev` 建表。
- [ ] 实现 `auth / posts / animes` 模块与 DTO，严格对齐接口契约（2.5）。
- [ ] 复刻：首次 admin 自动建号、`publishedAt` 写入、排序默认值、返回结构。
- [ ] 实现 JWT 守卫 + `bcrypt` 校验。
- [ ] 编写 `scripts/migrate-sqlite-to-mysql.ts`，跑通并完成 3.3 校验。
- [ ] **验收**：用旧管理员密码登录成功；接口返回结构与旧一致（用 Postman/curl 抽样比对）。

### 阶段 2：前端工程化与 Token 体系（1–2 天）
- [ ] `frontend/` 初始化 Vite + Vue3 + TS + Tailwind v4。
- [ ] 落地 `main.css` 的 `@theme` token 体系（4.4），用任一页面截图比对深浅色，确保零变化。
- [ ] 搭建路由、Pinia、axios、深浅色 composable、`useDialogOpen`。
- [ ] 搬入 `components/ui/**` 全套 Shadcn-vue，验证 `components.json` 别名。
- [ ] **验收**：空白页深浅色切换正常；UI 组件渲染正常。

### 阶段 3：前台页面迁移（2–3 天）
- [ ] `DefaultLayout`（导航栏、移动端菜单、页脚、滚动透明态）。
- [ ] `/`：RubiksCubeBackground + 打字机 + 最新文章（注意深色 `!important` 覆盖）。
- [ ] `/blog`、`/blog/:slug`（标签筛选、markdown-it、prose 排版、阅读量/时长）。
- [ ] `/animes`（时间轴/评分榜、滚动加载、分组、半星、骨架屏）。
- [ ] `/about`。
- [ ] **验收**：逐页与旧站截图比对，交互/动效/深浅色一致；数据来自新后端。

### 阶段 4：后台迁移（2–3 天）
- [ ] `AdminLayout`（侧边栏、骨架屏、强制登录弹窗）。
- [ ] 仪表盘、文章管理（表格 + CRUD）、新建/编辑（PostForm）。
- [ ] 番剧管理（搜索/排序/分页/URL 同步 + 函数式弹窗 CRUD + toast + localStorage 缓存）。
- [ ] **验收**：全流程 CRUD 与旧站一致；未登录弹窗、登出正常。

### 阶段 5：联调、部署与清理（1–2 天）
- [ ] 全量回归（见第六章清单）。
- [ ] 生产部署：前端构建静态资源（Nginx），后端 NestJS（PM2/systemd），Nginx 反代 `/api`。
- [ ] 环境变量：`DATABASE_URL`、`JWT_SECRET`、`CORS_ORIGIN`。
- [ ] 通过后，归档/删除根目录旧 Nuxt 代码与 `sqlite.db`（保留备份分支）。

---

## 六、功能一致性验收清单

> 迁移完成前，对照本清单逐项确认与旧版一致。

### 6.1 数据与接口
- [ ] 三表行数一致；时间字段 ISO 等值；tags 字符串逐字相等。
- [ ] `GET /api/posts` 返回裸数组、仅已发布、按 publishedAt 降序。
- [ ] `GET /api/posts/:slug` 未发布或不存在 → 404。
- [ ] `GET /api/animes` 默认 releaseDate/desc，分页结构正确。
- [ ] 管理 CRUD 全通过；`publishedAt` 规则正确。
- [ ] 首次 `admin` 自动建号；普通登录、登出、`/auth/me` 正常。
- [ ] 401/404/400 状态码与旧版一致。

### 6.2 前台页面
- [ ] 导航栏透明→滚动实色、移动端菜单、深浅色切换。
- [ ] 首页 3D 魔方（拖拽/自动旋转/深浅色配色）、打字机、最新文章 3 卡。
- [ ] 博客列表标签筛选 + 列表过渡动画、空状态。
- [ ] 博客详情 markdown 渲染、prose 排版、阅读量/时长、返回。
- [ ] 番剧时间轴/评分榜切换、升降序、滚动加载、分组、半星、悬停感想、骨架屏。
- [ ] 关于页静态内容与社交链接。

### 6.3 后台
- [ ] 未登录强制弹窗且不可关闭；登录后渲染内容。
- [ ] 仪表盘统计与欢迎信息。
- [ ] 文章表格状态徽标、编辑/删除二次确认。
- [ ] 文章表单 slug 自动生成、标签 JSON 互转、立即发布。
- [ ] 番剧表格搜索防抖、排序、分页、URL 同步、前进后退。
- [ ] 番剧函数式弹窗 CRUD + toast；新建时年份/季度 localStorage 缓存。

### 6.4 样式与体验
- [ ] 深浅色模式下所有页面视觉与旧版一致（重点：HSL token、`!important` 覆盖、prose 深色）。
- [ ] 页面/布局过渡动画复刻（opacity 0.4s）。
- [ ] 移动端响应式（汉堡菜单、表格滚动、弹窗全显）。

---

## 七、风险与对策（实施期）

| 风险 | 对策 |
| :--- | :--- |
| Tailwind v3→v4 少数类名/插件差异（如 typography 插件用法） | 先迁主体，逐页截图比对；必要时 v4 `@plugin` 引入 |
| three.js / Canvas 在 SSR 之外的行为差异 | 原本就只在客户端运行，迁 SPA 后更简单，注意 `onMounted` 生命周期 |
| JWT 替代 Cookie Session 后的 XSS 风险 | token 存内存优先，localStorage 次之；配合 CSP；过期时间不宜过长 |
| `useFetch` 的 SSR 预取丢失导致首屏白屏 | 改为 SPA 后可接受；如需 SEO 再考虑 Nuxt/SSR 渲染层 |
| 大小写敏感回归 | 建库强制 `utf8mb4_bin`，CI 加校验 |
| 迁移期间数据双写不一致 | 迁移期停写或只读旧库；切换流量后再让旧库归档 |

---

## 八、结论

本方案在不改变任何业务功能、保持页面样式与交互 1:1 的前提下，将单体 Nuxt 工程拆分为：
- **`backend/`**：NestJS + Prisma + MySQL，接口契约与现有完全对齐，密码哈希直接复用；
- **`frontend/`**：Vite + Vue3 + TS + Tailwind v4，基于现有 HSL 变量建立 `@theme` token 体系，Shadcn-vue 与特效组件原样复用。

数据库迁移因数据量小、字段映射清晰、时间/JSON 语义已明确，**整体低风险**。按第五阶段计划推进，每阶段可独立验收，旧单体可在验收通过前持续作为兜底运行。
