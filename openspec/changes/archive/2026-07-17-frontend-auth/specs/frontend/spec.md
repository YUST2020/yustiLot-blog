## ADDED Requirements

### Requirement: 前端鉴权层就绪

`frontend/` MUST 实现完整鉴权层：
- LoginDialog 使用 authStore.login，登录成功关闭弹窗。
- AdminLayout：侧边栏导航 + 顶栏；未登录显示骨架屏 + 强制 LoginDialog（preventClose）；登录后渲染内容。
- 退出登录调用 logout 接口 + 清登录态 + 跳首页。
- RouterLink 注册 NuxtLink 别名。

满足现有 `frontend` spec 的 AdminLayout 与 HTTP/鉴权场景。

#### Scenario: 未登录访问后台
- **WHEN** 未登录访问 /admin/**
- **THEN** 显示骨架屏并弹出不可关闭的登录弹窗，登录成功后渲染内容
