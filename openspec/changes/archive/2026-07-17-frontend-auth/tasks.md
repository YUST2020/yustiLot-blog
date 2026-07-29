## 1. LoginDialog 改造

- [x] 1.1 useUserSession → useAuthStore，登录调用 authStore.login
- [x] 1.2 显式 import computed/ref（Vue3 不自动导入）
- [x] 1.3 $fetch → authStore.login（封装了 axios + JWT）

## 2. AdminLayout 实现

- [x] 2.1 侧边栏（仪表盘/文章/番剧/设置占位/退出）+ RouterLink active-class
- [x] 2.2 顶栏（深浅色切换 + 头像）
- [x] 2.3 未登录显示骨架屏 + 强制 LoginDialog（preventClose）
- [x] 2.4 退出登录：POST /auth/logout + authStore.logout + 跳首页

## 3. 全局别名

- [x] 3.1 main.ts 注册 NuxtLink 全局别名 → RouterLink（兼容迁移页面）

## 4. 验收

- [x] 4.1 vue-tsc 编译零错误
- [x] 4.2 AdminLayout 布局与侧边栏导航完整
- [x] 4.3 LoginDialog 调用 authStore.login
