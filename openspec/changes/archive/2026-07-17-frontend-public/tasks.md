## 1. DefaultLayout

- [x] 1.1 导航栏（滚动变色/透明态判断/移动端汉堡菜单/深浅色切换/RouterLink active）
- [x] 1.2 页脚（年份 + Vue3 & Tailwind v4 标识）

## 2. 公开页面

- [x] 2.1 首页：RubiksCubeBackground + 打字机 + 最新文章 3 卡 + 深色高对比覆盖
- [x] 2.2 博客列表：ParticleBackground + 标签筛选 + TransitionGroup 动画 + 空状态
- [x] 2.3 博客详情：markdown-it 渲染 + prose 排版 + 阅读信息 + 选区色
- [x] 2.4 番剧列表：时间轴/评分切换 + 滚动加载 + 分组 + 半星 + 骨架屏
- [x] 2.5 关于：ParticleBackground + 头像/介绍/社交/技术栈（静态）

## 3. Nuxt API 迁移

- [x] 3.1 useFetch → axios onMounted/watch
- [x] 3.2 useHead → document.title
- [x] 3.3 NuxtLink → RouterLink（全局别名兜底）
- [x] 3.4 显式 import ref/computed/onMounted/watch
- [x] 3.5 每页包裹 DefaultLayout

## 4. 类型与编译

- [x] 4.1 tsconfig paths 配置 @/* 别名
- [x] 4.2 api/request 响应解包返回 any（解决 AxiosResponse 类型）
- [x] 4.3 useColorMode BasicColorSchema 类型适配
- [x] 4.4 useDialogOpen shallowReactive props cast
- [x] 4.5 admin 组件 ~/→@/、import.meta.server→env.SSR、PostForm 重复属性修复
- [x] 4.6 vue-tsc -b 零错误

## 5. 验收

- [x] 5.1 vue-tsc 编译零错误
- [x] 5.2 5 个公开页面 + DefaultLayout 全部实现
