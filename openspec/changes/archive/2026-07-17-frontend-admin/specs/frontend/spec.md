## ADDED Requirements

### Requirement: 后台页面就绪

`frontend/` MUST 实现全部后台页面，满足现有 `frontend` spec 的后台场景：
- 仪表盘（统计 + 写文章入口）、文章管理（表格 + 删除二次确认）、新建/编辑（PostForm）、番剧管理（搜索/排序/分页/URL 同步/函数式弹窗 CRUD/toast/缓存）。

#### Scenario: 后台页面可访问
- **WHEN** 登录后访问 /admin、/admin/posts、/admin/animes 等
- **THEN** 页面渲染，CRUD 与交互与现有 Nuxt 版一致
