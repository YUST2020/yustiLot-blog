## 1. 仪表盘

- [x] 1.1 文章总数统计 + 欢迎信息（authStore.user）+ 写文章入口

## 2. 文章管理

- [x] 2.1 表格（标题/状态徽标/发布时间/编辑删除）
- [x] 2.2 删除二次确认（confirm）+ refresh
- [x] 2.3 新建页：复用 PostForm + createPost
- [x] 2.4 编辑页：fetchAdminPost 回填 + updatePost

## 3. 番剧管理

- [x] 3.1 工具栏：搜索（300ms 防抖）/排序 Select/升降序
- [x] 3.2 表格：封面+标题+感想/评分/上映时间/编辑删除
- [x] 3.3 函数式弹窗 CRUD（useDialogOpen + AnimeDialog）+ toast
- [x] 3.4 分页（上一页/下一页/总页数）+ URL 同步 + 浏览器前进后退恢复
- [x] 3.5 AnimeForm localStorage 缓存年份/季度（已在 C6 迁移的组件中）

## 4. 验收

- [x] 4.1 vue-tsc 编译零错误
- [x] 4.2 5 个后台页面全部实现
- [x] 4.3 类型兼容（Input update:modelValue string|number）
