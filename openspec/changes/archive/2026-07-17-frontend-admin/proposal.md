## Why

前台页面（C8）完成。本 change 实现后台 5 个页面：仪表盘、文章管理/新建/编辑、番剧管理。迁移自现有 Nuxt 页面，替换 Nuxt API（useFetch/useUserSession/definePageMeta/navigateTo/$fetch），复用已迁移的 PostForm/AnimeForm/AnimeDialog + useDialogOpen 函数式弹窗。

## What Changes

- 仪表盘 `/admin`：文章总数统计 + 欢迎信息 + 写文章入口。
- 文章管理 `/admin/posts`：表格（标题/状态/时间/操作）+ 删除二次确认。
- 新建/编辑 `/admin/posts/create`、`/admin/posts/:id`：复用 PostForm。
- 番剧管理 `/admin/animes`：搜索/排序/分页 + URL 同步 + 函数式弹窗 CRUD + toast + localStorage 缓存。

## Capabilities

### New Capabilities
无。

### Modified Capabilities
- `frontend`: 首次落地后台页面与番剧管理 CRUD requirement。

## Impact

- **代码**：实现 5 个后台页面。
- **回滚**：还原占位文件。
