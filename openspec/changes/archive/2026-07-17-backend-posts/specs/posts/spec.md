## ADDED Requirements

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
