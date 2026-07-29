## ADDED Requirements

### Requirement: 前台公开页面就绪

`frontend/` MUST 实现全部前台页面，满足现有 `frontend` spec 的前台场景：
- DefaultLayout（滚动变色导航/透明态/移动端菜单/深浅色/页脚）。
- 首页（3D 魔方 + 打字机 + 最新文章）、博客列表（标签筛选 + 动画）、博客详情（markdown + prose）、番剧列表（时间轴/评分/滚动加载/半星）、关于（静态）。

#### Scenario: 前台页面可访问
- **WHEN** 访问 /、/blog、/blog/:slug、/animes、/about
- **THEN** 页面渲染，视觉与交互与现有 Nuxt 版一致
