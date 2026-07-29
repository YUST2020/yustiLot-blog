## Why

后端 API 与数据已就绪（C1–C5）。前端需从 Nuxt 迁至独立 Vite SPA。本 change 搭建工程地基：Vite+Vue3+TS、Tailwind v4 token 体系（核心，保证样式零变化）、Shadcn-vue 组件迁移、vue-router、Pinia、axios、深浅色、useDialogOpen 去耦合。是 C7–C9 页面迁移的基础。

## What Changes

- Vite + Vue 3.5 + TS 工程初始化。
- Tailwind CSS v4：用 `@theme` 把现有 HSL 语义变量映射为 v4 token（`bg-background` 等类名零改动）。
- 迁移 `app/components/ui/**` 全套 Shadcn-vue（reka-ui/radix-vue）+ `lib/utils.ts`。
- vue-router 4（路由表对齐现有）、Pinia、axios（带代理/dev）。
- 深浅色 composable（替代 @nuxtjs/color-mode）。
- useDialogOpen 去除 useNuxtApp 依赖，改注入 Vite app context。
- 迁移 `RubiksCubeBackground`、`ParticleBackground`（three/Canvas 特效，C8 用）。
- `index.html` + `main.ts` + `App.vue`（RouterView + 全局过渡 + Toaster）。

## Capabilities

### New Capabilities
无。落地现有 `frontend` spec 的地基类 requirement 与 `architecture` 的 token/深浅色 requirement。

### Modified Capabilities
- `frontend`: 首次落地工程地基相关 requirement（HTTP层、函数式弹窗去耦合、过渡动画等先于页面落地）。

## Impact

- **代码**：`frontend/` 下生成完整 Vite 工程 + UI 组件 + composables。
- **依赖**：vue、vue-router、pinia、axios、tailwindcss v4、reka-ui、radix-vue、lucide、markdown-it、three、tween.js、@vueuse/*、vue-sonner 等。
- **回滚**：删除 frontend/ 即可（不影响后端）。
