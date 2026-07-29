## Why

前端地基与鉴权（C6/C7）就绪。本 change 实现全部前台公开页面与 DefaultLayout，迁移自现有 Nuxt 页面，替换 Nuxt API（useFetch/useHead/v-motion-*/NuxtLink），保持功能与视觉 1:1。

## What Changes

- DefaultLayout：导航栏（滚动变色/透明态/移动端菜单/深浅色）+ 页脚。
- 首页 `/`：RubiksCubeBackground + 打字机 + 最新文章 3 卡。
- 博客列表 `/blog`：ParticleBackground + 标签筛选 + 列表动画。
- 博客详情 `/blog/:slug`：markdown-it 渲染 + prose 排版 + 阅读信息。
- 番剧列表 `/animes`：ParticleBackground + 时间轴/评分榜 + 滚动加载 + 半星。
- 关于 `/about`：ParticleBackground + 静态内容。

## Capabilities

### New Capabilities
无。

### Modified Capabilities
- `frontend`: 首次落地全部前台页面与 DefaultLayout requirement。

## Impact

- **代码**：实现 DefaultLayout + 5 个公开页面。
- **回滚**：还原占位文件。
