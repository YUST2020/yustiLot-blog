## 1. Vite 工程初始化

- [x] 1.1 Vite + Vue3 + TS 工程创建，清理默认模板文件
- [x] 1.2 安装依赖：vue-router、pinia、axios、tailwindcss v4、reka-ui、radix-vue、lucide、markdown-it、three、tween.js、@vueuse/*、vue-sonner 等
- [x] 1.3 vite.config.ts：@别名、dev proxy /api → backend:3000

## 2. Tailwind v4 token 体系

- [x] 2.1 main.css：@import tailwindcss + @plugin typography
- [x] 2.2 :root/.dark HSL 变量（沿用现有数值）
- [x] 2.3 @theme inline 映射 color-* token（bg-background 等类名生效）
- [x] 2.4 base 层全局样式 + 页面过渡动画

## 3. 组件迁移

- [x] 3.1 迁移 lib/utils.ts
- [x] 3.2 迁移全套 ui/** Shadcn-vue 组件（badge/button/card/dialog/input/label/rating/select/separator/skeleton/sonner/table/textarea/tooltip）
- [x] 3.3 迁移 ParticleBackground、RubiksCubeBackground（加 useColorMode 显式 import）

## 4. 地基设施

- [x] 4.1 composables/useColorMode.ts（vueuse class 切换，替代 @nuxtjs/color-mode）
- [x] 4.2 composables/useDialogOpen.ts（setApp 注入，去除 useNuxtApp）
- [x] 4.3 api/request.ts（axios 实例 + JWT 拦截器 + 401 清登录态）
- [x] 4.4 api/posts.ts、api/animes.ts
- [x] 4.5 stores/auth.ts（token/user 持久化、login/fetchMe/logout）
- [x] 4.6 router/index.ts（路由表对齐 + 全局守卫恢复登录态 + /login 重定向）
- [x] 4.7 main.ts（createApp + pinia + router + setApp + 引入 main.css）
- [x] 4.8 App.vue（RouterView + page 过渡 + Toaster）

## 5. 验收

- [x] 5.1 vue-tsc 编译零错误
- [x] 5.2 npm run dev 启动，5173 返回 200
- [x] 5.3 token 体系生效（bg-background/text-foreground 渲染）
- [x] 5.4 /api 代理到后端 3000
- [x] 5.5 占位页面与路由全部可访问
