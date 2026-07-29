## Why

后端鉴权（C2）就绪后，文章是第一个内容模块。前台博客列表/详情依赖公开接口，后台 CRUD 依赖管理接口（受 JwtAuthGuard 保护）。本 change 实现 posts 全部契约，是前端 C8 博客页面的后端支撑。

## What Changes

- 实现 `PostsModule`：`PostsController`（公开 `/api/posts`）、`PostsAdminController`（管理 `/api/admin/posts/**`）、`PostsService`、DTO。
- `GET /api/posts`：返回已发布文章**裸数组**，按 publishedAt 降序，支持 page/limit。
- `GET /api/posts/:slug`：仅返回已发布，未发布/不存在 404。
- `GET /api/admin/posts`：返回全部（含草稿），按 createdAt 降序。
- `POST/GET/PUT/DELETE /api/admin/posts/:id`：管理 CRUD。
- `publishedAt` 写入规则复刻：isPublished 且无值→当前时间；有值→解析；否则 null。
- `tags` 保持 JSON 字符串契约（不做 parse/stringify 转换，原样存取）。

## Capabilities

### New Capabilities
无。落地现有 `posts` spec。

### Modified Capabilities
- `posts`: 首次落地全部 posts requirement。

## Impact

- **代码**：新增 `src/modules/posts/`（controllers/service/dto/module）。
- **数据库**：读写 posts 表。
- **回滚**：删除 posts 模块 + 移除 AppModule 引用。
