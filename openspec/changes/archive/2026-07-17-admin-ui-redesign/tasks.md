## 1. 设计语言与 change

- [x] 1.1 开 OpenSpec change admin-ui-redesign（proposal/design/specs delta）
- [x] 1.2 design.md：现代简约 SaaS 风 token/表单/表格/徽标/布局规范

## 2. AdminLayout 重构

- [x] 2.1 现代化侧边栏（分组导航、bg-card、激活态 bg-primary/10、用户区、退出）
- [x] 2.2 顶栏（h-16 border-b backdrop-blur + 主题切换）
- [x] 2.3 移动端抽屉化（遮罩 + 汉堡触发）+ router-link-exact-active 激活态

## 3. 仪表盘

- [x] 3.1 统计卡片网格（总文章/已发布/草稿 + 图标 + 加载骨架）
- [x] 3.2 最近文章列表（状态徽标 + 查看全部）

## 4. 文章管理

- [x] 4.1 工具栏（搜索 + 计数）+ 现代化表格（行 hover、状态徽标、操作图标）
- [x] 4.2 PostForm：native input/textarea/checkbox + 统一 token 样式

## 5. 番剧管理

- [x] 5.1 工具栏（搜索 + native select 排序 + 升降序）+ 现代化表格
- [x] 5.2 分页（native 按钮 + 禁用态）保留搜索/URL 同步/函数式弹窗逻辑
- [x] 5.3 AnimeForm：native 控件 + 自实现半星 Rating + native select 年份/季度
- [x] 5.4 AnimeDialog：Teleport + 遮罩 + token 卡片（移除 shadcn dialog）

## 6. 登录

- [x] 6.1 LoginDialog：Teleport + 卡片 + 带图标输入 + 错误提示（移除 radix-vue）

## 7. 校验与联调

- [x] 7.1 vue-tsc 编译零错误
- [x] 7.2 端到端联调：首页/登录/admin posts(1篇)/admin animes(55条) 链路正常

## 8. 文档

- [x] 8.1 重写 AGENTS.md（前后端分离架构 + token + native 后台规范 + SaaS 设计语言 + OpenSpec）
- [x] 8.2 同步 openspec/project.md 编码规范
