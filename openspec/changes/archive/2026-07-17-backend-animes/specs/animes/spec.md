## ADDED Requirements

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
