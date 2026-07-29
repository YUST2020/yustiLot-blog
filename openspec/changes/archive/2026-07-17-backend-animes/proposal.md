## Why

后端文章模块（C3）就绪后，番剧是第二个内容模块。前台番剧时间轴/评分榜依赖公开分页接口（含 releaseDate 双字段排序），后台依赖带搜索的管理分页接口。本 change 实现 animes 全部契约，是前端 C8 番剧页面的后端支撑。

## What Changes

- 实现 `AnimesModule`：`AnimesController`（公开 `/api/animes`）、`AnimesAdminController`（管理 `/api/admin/animes/**`）、`AnimesService`、DTO。
- `GET /api/animes`：分页对象 `{ items, total, page, pageSize, totalPages }`；page 默认1、pageSize 默认12上限100；sortBy 默认 releaseDate（rating/createdAt）、order 默认 desc；releaseDate 按 release_year 再 release_quarter 排序。
- `GET /api/admin/animes`：同结构 + search（title LIKE）；pageSize 默认10；sortBy 可含 createdAt。
- `POST/GET/PUT/DELETE /api/admin/animes/:id`：管理 CRUD，id 非数字 400。

## Capabilities

### New Capabilities
无。落地现有 `animes` spec。

### Modified Capabilities
- `animes`: 首次落地全部 animes requirement。

## Impact

- **代码**：新增 `src/modules/animes/`（controllers/service/dto/module）。
- **数据库**：读写 animes 表。
- **回滚**：删除 animes 模块 + 移除 AppModule 引用。
