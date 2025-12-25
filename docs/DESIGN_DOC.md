# 技术实现方案与设计文档

## 1. 数据库设计 (Schema)

使用 **Drizzle ORM** 定义，基于 **SQLite**。

### 1.1 Users 表
存储管理员信息。

| 字段         | 类型      | 说明                             |
| :----------- | :-------- | :------------------------------- |
| `id`         | `Integer` | 主键                             |
| `username`   | `Text`    | 登录名                           |
| `password`   | `Text`    | 加密后的哈希密码 (Argon2/Bcrypt) |
| `name`       | `Text`    | 昵称                             |
| `avatar`     | `Text`    | 头像 URL                         |
| `created_at` | `Integer` | 创建时间                         |

### 1.2 Posts 表
存储博客文章。

| 字段           | 类型      | 说明                |
| :------------- | :-------- | :------------------ |
| `id`           | `Integer` | 主键                |
| `title`        | `Text`    | 标题                |
| `slug`         | `Text`    | URL 别名 (唯一索引) |
| `content`      | `Text`    | Markdown 原始内容   |
| `excerpt`      | `Text`    | 摘要                |
| `cover_image`  | `Text`    | 封面图 URL          |
| `tags`         | `Text`    | JSON 数组存储标签   |
| `is_published` | `Boolean` | 是否发布            |
| `view_count`   | `Integer` | 阅读量              |
| `published_at` | `Integer` | 发布时间            |
| `created_at`   | `Integer` | 创建时间            |
| `updated_at`   | `Integer` | 更新时间            |

---

## 2. API 接口设计 (Nuxt Server)

### 2.1 认证 (Auth)
- `POST /api/auth/login`: 登录，签发 Session Cookie。
- `POST /api/auth/logout`: 登出，清除 Session。
- `GET /api/auth/me`: 获取当前登录用户信息。

### 2.2 博客 (Public)
- `GET /api/posts`: 获取已发布文章列表 (分页)。
- `GET /api/posts/:slug`: 获取单篇文章详情 (通过 Slug)。

### 2.3 管理 (Admin) - 需鉴权
- `GET /api/admin/posts`: 获取所有文章 (含草稿)。
- `POST /api/admin/posts`: 创建文章。
- `PUT /api/admin/posts/:id`: 更新文章。
- `DELETE /api/admin/posts/:id`: 删除文章。
- `POST /api/admin/upload`: 图片上传 (存本地或 OSS)。

---

## 3. 目录结构规划

```
root/
├── server/
│   ├── api/            # 业务接口
│   ├── database/       # Drizzle Schema & Migrations
│   ├── middleware/     # 服务端中间件 (鉴权)
│   └── utils/          # 密码哈希等工具
├── pages/
│   ├── index.vue       # 首页
│   ├── blog/           # 博客前台
│   ├── login.vue       # 登录页
│   └── admin/          # 后台管理 (嵌套路由)
├── components/
│   ├── ui/             # Shadcn
│   └── admin/          # 后台专用组件
├── layouts/
│   ├── default.vue     # 前台布局
│   └── admin.vue       # 后台布局 (Sidebar)
└── middleware/         # 客户端路由中间件 (Auth Guard)
```