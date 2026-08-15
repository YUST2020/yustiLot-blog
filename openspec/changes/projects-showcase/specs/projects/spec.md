## ADDED Requirements

### Requirement: 作品数据模型

`projects` 表 SHALL 按以下字段存储作品记录：

| 字段 | 类型 | 约束 | 说明 |
|:---|:---|:---|:---|
| `id` | Int | PK auto-increment | ID |
| `name` | String(255) | not null | 作品名称 |
| `description` | String(1000)? | nullable | 作品简介 |
| `cover_image` | String(512)? | nullable | 封面图 URL |
| `repo_url` | String(512)? | nullable | 源码链接 |
| `demo_url` | String(512)? | nullable | 在线预览链接 |
| `tech_stack` | LongText? | nullable | 技术栈，**JSON 字符串数组**（与 posts.tags 约定一致） |
| `sort_order` | Int | default 0 | 排序权重，越大越靠前 |
| `is_visible` | TinyInt(1) | default true | 是否前台可见 |
| `created_at` | DateTime(3) | default now | 创建时间（UTC） |
| `updated_at` | DateTime(3) | default now | 更新时间（UTC） |

**不变式**：`tech_stack` 由前端 `JSON.parse`，后端原样存取（非原生 JSON 类型）。

### Requirement: 公开作品列表

系统 SHALL 提供 `GET /api/projects`，返回全部可见作品（无需鉴权）。
- 仅返回 `is_visible = true` 的记录；**不分页**，直接返回数组。
- 排序：`sort_order` 从大到小，相同则 `created_at` 从晚到早。

#### Scenario: 默认查询

- **WHEN** 调用 GET /api/projects
- **THEN** 返回全部可见作品数组，按 sort_order desc、created_at desc 排序

#### Scenario: 隐藏作品不出现

- **WHEN** 存在 is_visible=false 的作品并调用 GET /api/projects
- **THEN** 该记录不出现在返回结果中

### Requirement: 管理端作品 CRUD

系统 SHALL 提供管理端作品接口（全局 JwtAuthGuard 保护）。
- `GET /api/admin/projects`：全量列表（含隐藏），排序同公开列表。
- `POST /api/admin/projects`：创建。`name` 必填；`description/coverImage/repoUrl/demoUrl/techStack` 可选；`sortOrder` 默认 0（≥0 整数）；`isVisible` 默认 true。
- `GET /api/admin/projects/:id`：详情。
- `PUT /api/admin/projects/:id`：全量替换更新。
- `DELETE /api/admin/projects/:id`：删除，返回 `{ success: true }`。
- id 非数字 → 400；不存在 → 404；DTO 校验失败 → 400。

#### Scenario: 创建作品默认值

- **WHEN** POST /api/admin/projects 传入 `{ "name": "blog", "techStack": "[\"Vue3\",\"NestJS\"]" }`
- **THEN** 创建成功，sortOrder=0、isVisible=true

#### Scenario: 非法 id

- **WHEN** GET /api/admin/projects/abc
- **THEN** 返回 400

#### Scenario: 更新可见性影响前台

- **WHEN** PUT /api/admin/projects/:id 将某作品 isVisible 置为 false
- **THEN** 该作品不再出现在 GET /api/projects 结果中
