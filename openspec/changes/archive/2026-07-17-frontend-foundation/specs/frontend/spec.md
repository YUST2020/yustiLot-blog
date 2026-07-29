## ADDED Requirements

### Requirement: 前端工程地基就绪

`frontend/` MUST 存在可运行的 Vite + Vue 3 + TS 工程，具备：
- Tailwind v4 token 体系（`@theme` 映射 HSL 变量，`bg-background`/`text-foreground` 等类名生效，深浅色两套数值沿用现有）。
- 迁移全套 Shadcn-vue UI 组件 + lib/utils。
- vue-router 4、Pinia、axios（dev proxy → backend:3000/api）。
- 深浅色 composable（class 切换 + localStorage）。
- useDialogOpen 去耦合（注入 Vite app context）。
- RubiksCubeBackground、ParticleBackground 特效组件迁移。

满足现有 `frontend` 与 `architecture` spec 的地基场景。

#### Scenario: 工程启动
- **WHEN** 执行 npm run dev
- **THEN** Vite 在 5173 监听，/api 请求代理到后端 3000

#### Scenario: token 体系生效
- **WHEN** 渲染任一使用 bg-background 的元素
- **THEN** 深浅色切换时背景色随 token 变化，视觉与现有 Nuxt 版一致
