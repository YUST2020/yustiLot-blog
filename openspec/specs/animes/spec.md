# Animes Specification

> 番剧记录能力：公开分页列表（时间轴/评分排序）+ 管理端 CRUD（搜索/排序/分页）。
> 功能与现有 Nuxt 版本一致；评分 0–10 含半分；季度 {1,4,7,10}。

## Purpose

支撑前台番剧时间轴/评分榜浏览（滚动加载）与后台番剧记录管理。

## Data Model

`animes` 表字段（与现有对齐，迁移映射见 `data-migration` spec）：

| 字段 | 类型 | 约束 | 说明 |
|:---|:---|:---|:---|
| `id` | Int | PK auto-increment | ID |
| `title` | String(255) | not null | 番剧名 |
| `cover_image` | String(512) | not null | 封面图 URL |
| `rating` | Int | not null | 评分 0–10，**含奇数（半分）** |
| `review` | String(500)? | nullable | 一句话感想 |
| `release_year` | Int | not null | 上映年份 |
| `release_quarter` | Int | not null | 上映季度，取值 {1,4,7,10} |
| `created_at` | DateTime(3) | default now | 创建时间 |
| `updated_at` | DateTime(3) | default now | 更新时间 |

**不变式**：`rating` 允许 0–10 任意整数（含奇数，前端按 `rating/2` 渲染 5 星并支持半星）；`release_quarter` 仅允许 1/4/7/10（冬/春/夏/秋）。
## Requirements
### Requirement: 公开番剧分页列表

系统 SHALL 提供 `GET /api/animes`，返回分页番剧列表（无需鉴权）。
- 查询参数：`page`（默认 1，最小 1）、`pageSize`（默认 12，最小 1，**上限 100**）、`sortBy`（默认 `releaseDate`，可选 `rating`/`createdAt`）、`order`（默认 `desc`，可选 `asc`）。
- 排序规则：
  - `releaseDate` → 先按 `release_year`，再按 `release_quarter`，方向同 `order`；
  - `rating` → 按 `rating`；
  - 其他 → 按 `created_at`。
- 返回结构：**分页对象** `{ items, total, page, pageSize, totalPages }`，其中 `totalPages = ceil(total / pageSize)`。

#### Scenario: 默认查询
- **WHEN** 不带参数调用 GET /api/animes
- **THEN** 返回第 1 页、pageSize=12、sortBy=releaseDate、order=desc 的分页对象

#### Scenario: 按评分降序
- **WHEN** 调用 GET /api/animes?sortBy=rating&order=desc
- **THEN** items 按 rating 从高到低排列

#### Scenario: 按上映时间排序含季度二级排序
- **WHEN** 同年番剧按 releaseDate 排序
- **THEN** 同 release_year 内按 release_quarter 二级排序

#### Scenario: pageSize 上限
- **WHEN** 调用 GET /api/animes?pageSize=999
- **THEN** 实际 pageSize 被钳制为 100

### Requirement: 管理端番剧分页列表

系统 SHALL 提供 `GET /api/admin/animes`（需鉴权），返回带搜索的分页列表。
- 查询参数：`page`（默认 1）、`pageSize`（默认 10，上限 100）、`search`（可选，按 `title` LIKE 模糊匹配）、`sortBy`（默认 `releaseDate`，可选 `rating`/`createdAt`）、`order`（默认 `desc`）。
- 排序规则同公开列表；`total` 与 `totalPages` 基于筛选后结果集。
- 返回结构：分页对象 `{ items, total, page, pageSize, totalPages }`。

#### Scenario: 搜索标题
- **WHEN** 调用 GET /api/admin/animes?search=孤独
- **THEN** items 仅包含 title 含「孤独」的记录，total 为匹配数

#### Scenario: 默认分页
- **WHEN** 不带参数调用 GET /api/admin/animes
- **THEN** 返回第 1 页、pageSize=10、sortBy=releaseDate、order=desc

### Requirement: 创建番剧记录

系统 SHALL 提供 `POST /api/admin/animes`（需鉴权）创建番剧。
入参 body：`{ title, coverImage, rating, review?, releaseYear, releaseQuarter }`。
`created_at` / `updated_at` 设为当前时间。返回新建记录。

#### Scenario: 创建记录
- **WHEN** 提交合法字段
- **THEN** 记录持久化，返回含新 id 的完整记录

### Requirement: 获取单条番剧（管理）

系统 SHALL 提供 `GET /api/admin/animes/:id`（需鉴权），按 id 返回记录；id 非数字返回 400，不存在返回 404。

#### Scenario: 获取记录
- **WHEN** 已登录用户调用 GET /api/admin/animes/3
- **THEN** 返回该 id 的番剧记录

#### Scenario: id 非法
- **WHEN** 调用 GET /api/admin/animes/abc
- **THEN** 返回 400

#### Scenario: 记录不存在
- **WHEN** 调用 GET /api/admin/animes/999999
- **THEN** 返回 404

### Requirement: 更新番剧记录

系统 SHALL 提供 `PUT /api/admin/animes/:id`（需鉴权）更新番剧。
入参 body 同创建（不含时间戳）；`updated_at` 刷新为当前时间。返回更新后的记录。

#### Scenario: 更新评分
- **WHEN** 更新 rating 为 9
- **THEN** rating 持久化为 9，updated_at 刷新

### Requirement: 删除番剧记录

系统 SHALL 提供 `DELETE /api/admin/animes/:id`（需鉴权）物理删除，返回 `{ success: true }`。id 非数字返回 400。

#### Scenario: 删除记录
- **WHEN** 已登录用户调用 DELETE /api/admin/animes/3
- **THEN** 记录被物理删除，返回 { success: true }

### Requirement: 番剧模块实现就绪

`backend/` MUST 实现完整 animes 模块，满足现有 `animes` spec 的全部场景：
- `AnimesController`：`GET /api/animes`（@Public，分页对象）。
- `AnimesAdminController`：`GET（带 search）/POST/GET:id/PUT:id/DELETE:id /api/admin/animes`（全局守卫保护）。
- 排序复刻：releaseDate 按 release_year 再 release_quarter；pageSize 上限 100；id 非数字 400。

#### Scenario: 公开列表返回分页对象
- **WHEN** 调用 GET /api/animes
- **THEN** 返回 { items, total, page, pageSize, totalPages }，默认 pageSize=12、sortBy=releaseDate、order=desc

#### Scenario: releaseDate 双字段排序
- **WHEN** sortBy=releaseDate
- **THEN** 先按 release_year，再按 release_quarter 排序

