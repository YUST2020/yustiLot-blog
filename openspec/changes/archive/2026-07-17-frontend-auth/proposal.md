## Why

前端地基（C6）就绪。鉴权层是后台页面（C9）的前置：LoginDialog 需从 Nuxt session 改为 Pinia auth store + axios，AdminLayout 需实现完整侧边栏、未登录骨架屏与强制登录弹窗。本 change 让后台可登录访问。

## What Changes

- 改造 LoginDialog.vue：`useUserSession` → `useAuthStore`，登录成功 `authStore.login()`。
- 实现 AdminLayout.vue：左侧栏（仪表盘/文章/番剧/设置占位/退出）+ 顶栏（深浅色/头像）；未登录显示骨架屏并强制弹 LoginDialog（preventClose）。
- 退出登录：调 `POST /api/auth/logout` + `authStore.logout()` + 跳首页。
- RouterLink 全局注册别名 `NuxtLink`（业务组件可能用到）。

## Capabilities

### New Capabilities
无。

### Modified Capabilities
- `frontend`: 首次落地 AdminLayout 行为、HTTP 与鉴权层相关 requirement。

## Impact

- **代码**：改造 LoginDialog.vue、AdminLayout.vue、main.ts（注册 NuxtLink）。
- **回滚**：还原占位文件即可。
