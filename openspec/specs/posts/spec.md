# Posts Specification

> 博客文章能力：公开列表/详情 + 管理端 CRUD。
> 功能与现有 Nuxt 版本一致；Markdown 内容前台渲染，tags 以 JSON 字符串存储。

## Purpose

支撑前台博客阅读（列表筛选、详情渲染）与后台内容管理（草稿/发布、CRUD）。

## Data Model

`posts` 表字段（与现有对齐，迁移映射见 `data-migration` spec）：

| 字段 | 类型 | 约束 | 说明 |
|:---|:---|:---|:---|
| `id` | Int | PK auto-increment | 文章 ID |
| `title` | String(255) | not null | 标题 |
| `slug` | String(255) | unique | URL 别名 |
| `content` | LongText | not null | Markdown 原文 |
| `excerpt` | String(500)? | nullable | 摘要 |
| `cover_image` | String(512)? | nullable | 封面图 URL |
| `tags` | LongText? | nullable | **JSON 字符串数组**（如 `["Vue","Nuxt"]`），非原生 JSON 类型 |
| `is_published` | TinyInt(1) | default 0 | 是否发布 |
| `view_count` | Int | default 0 | 阅读量 |
| `published_at` | DateTime(3)? | nullable | 发布时间（UTC） |
| `created_at` | DateTime(3) | default now | 创建时间 |
| `updated_at` | DateTime(3) | default now | 更新时间 |

**不变式**：`tags` 列存储 JSON 字符串（非 MySQL 原生 JSON 类型），前端依赖 `JSON.parse` 解析。
## Requirements
### Requirement: 公开文章列表

系统 SHALL 提供 `GET /api/posts`，返回**已发布**文章列表。
- 查询参数：`page`（默认 1）、`limit`（默认 10）。
- 过滤：`is_published = true`。
- 排序：`published_at DESC`。
- 返回结构：**文章数组（裸数组）**，非分页对象。

#### Scenario: 默认分页
- **WHEN** 不带参数调用 GET /api/posts
- **THEN** 返回第 1 页、最多 10 条已发布文章，按 published_at 降序

#### Scenario: 自定义分页
- **WHEN** 调用 GET /api/posts?page=2&limit=3
- **THEN** 返回第 2 页、最多 3 条，跳过前 3 条

#### Scenario: 草稿不返回
- **WHEN** 存在 is_published=false 的文章
- **THEN** 这些文章不出现在公开列表中

### Requirement: 公开文章详情

系统 SHALL 提供 `GET /api/posts/:slug`，按 slug 返回单篇**已发布**文章。
- 仅返回 `is_published = true` 的文章；未发布或不存在返回 404。

#### Scenario: 获取已发布文章
- **WHEN** 调用 GET /api/posts/existing-published-slug
- **THEN** 返回 200 与该文章完整字段

#### Scenario: 文章不存在
- **WHEN** 调用 GET /api/posts/non-existent-slug
- **THEN** 返回 404

#### Scenario: 文章为草稿
- **WHEN** 调用 GET /api/posts/draft-slug，该文章 is_published=false
- **THEN** 返回 404（草稿对公开接口不可见）

### Requirement: 管理端文章列表

系统 SHALL 提供 `GET /api/admin/posts`（需鉴权），返回**所有**文章（含草稿）。
- 排序：`created_at DESC`。
- 返回结构：文章数组。

#### Scenario: 列出全部含草稿
- **WHEN** 已登录用户调用 GET /api/admin/posts
- **THEN** 返回所有文章（含 is_published=false），按 created_at 降序

### Requirement: 创建文章

系统 SHALL 提供 `POST /api/admin/posts`（需鉴权）创建文章。
入参 body：`{ title, slug, content, excerpt?, coverImage?, tags?, isPublished?, publishedAt? }`。
`publishedAt` 写入规则：
- `isPublished === true && !publishedAt` → 设为当前时间；
- `publishedAt` 有值 → `new Date(publishedAt)`；
- 否则 null。

#### Scenario: 创建并立即发布
- **WHEN** 提交 isPublished=true 且未给 publishedAt
- **THEN** publishedAt 写为当前时间，文章持久化

#### Scenario: 创建草稿
- **WHEN** 提交 isPublished=false
- **THEN** publishedAt 为 null，文章持久化为草稿

#### Scenario: 指定发布时间
- **WHEN** 提交 publishedAt 为某历史日期字符串
- **THEN** publishedAt 解析为该日期时间存储

### Requirement: 获取单篇文章（管理）

系统 SHALL 提供 `GET /api/admin/posts/:id`（需鉴权），按 id 返回文章（含草稿）；不存在返回 404。

#### Scenario: 获取任意文章
- **WHEN** 已登录用户调用 GET /api/admin/posts/5
- **THEN** 返回该 id 的文章（无论是否发布）

#### Scenario: 文章不存在
- **WHEN** 调用 GET /api/admin/posts/999999
- **THEN** 返回 404

### Requirement: 更新文章

系统 SHALL 提供 `PUT /api/admin/posts/:id`（需鉴权）更新文章。
入参与 `publishedAt` 写入规则同「创建文章」。返回更新后的文章。

#### Scenario: 草稿转为发布
- **WHEN** 将某草稿 isPublished 置 true 且未给 publishedAt
- **THEN** publishedAt 写为当前时间

#### Scenario: 更新内容字段
- **WHEN** 更新 title/content 等
- **THEN** 字段持久化，updated_at 刷新

### Requirement: 删除文章

系统 SHALL 提供 `DELETE /api/admin/posts/:id`（需鉴权）物理删除文章，返回 `{ success: true }`。
**物理删除**（与现状一致），不做软删除。

#### Scenario: 删除文章
- **WHEN** 已登录用户调用 DELETE /api/admin/posts/3
- **THEN** 文章被物理删除，返回 { success: true }

### Requirement: tags JSON 字符串契约

系统 MUST 将 `tags` 以 JSON 字符串（如 `["Vue","Nuxt"]`）持久化与返回，**不使用 MySQL 原生 JSON 类型**。
返回给前端的 `tags` 字段 MUST 为字符串，由前端 `JSON.parse` 解析。

#### Scenario: 存储与返回 tags
- **WHEN** 创建文章时 tags 为 `["Vue","Nuxt"]`
- **THEN** 数据库与接口返回的 tags 字段为字符串 `"[\"Vue\",\"Nuxt\"]"`

### Requirement: 阅读量字段保留

系统 MUST 保留 `view_count` 字段并原值返回。
**注**：现有系统详情接口仅读取不累加阅读量；本规格如实保留该行为（不新增自增逻辑）。

#### Scenario: 阅读量不变
- **WHEN** 多次访问文章详情
- **THEN** view_count 保持迁移时原值不变

### Requirement: 文章模块实现就绪

`backend/` MUST 实现完整 posts 模块，满足现有 `posts` spec 的全部场景：
- `PostsController`：`GET /api/posts`（@Public，裸数组）、`GET /api/posts/:slug`（@Public，仅已发布）。
- `PostsAdminController`：`GET/POST/GET/:id/PUT/:id/DELETE/:id /api/admin/posts`（受全局守卫保护）。
- `publishedAt` 写入规则严格复刻；`tags` 原样存取（JSON 字符串契约）。

#### Scenario: 公开列表返回裸数组
- **WHEN** 调用 GET /api/posts
- **THEN** 返回 JSON 数组（非分页对象），仅含已发布，按 publishedAt 降序

#### Scenario: 管理接口受保护
- **WHEN** 未带 token 调用 GET /api/admin/posts
- **THEN** 返回 401

