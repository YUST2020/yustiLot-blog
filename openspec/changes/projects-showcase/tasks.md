## 1. 后端

- [x] 1.1 Prisma `Project` model + `prisma db push` + generate
- [x] 1.2 CreateProjectDto/UpdateProjectDto（name 必填，URL/简介长度校验，sortOrder≥0，isVisible 布尔）
- [x] 1.3 ProjectsService：listPublic（仅可见、sortOrder desc → createdAt desc）、listAdmin（全量）、getById/create/update/remove（id 非法 400、不存在 404）
- [x] 1.4 ProjectsController（@Public）+ ProjectsAdminController + ProjectsModule + AppModule 注册

## 2. 前端前台

- [x] 2.1 `api/projects.ts`（公开列表 + 管理 CRUD）
- [x] 2.2 `/projects` 作品展示页：粒子背景 hero + 响应式卡片墙（封面缺省占位、源码/预览链接、技术栈徽标、深浅色适配）
- [x] 2.3 路由 `/projects` + DefaultLayout 桌面/移动导航「作品」+ isTransparentPage 列表

## 3. 前端后台

- [x] 3.1 `ProjectForm.vue` + `ProjectDialog.vue`（原生表单 + useDialogOpen 弹窗）
- [x] 3.2 `/admin/projects` 管理页：表格（作品/链接/技术栈/排序/可见性/操作）+ 客户端搜索 + 新增/编辑/删除
- [x] 3.3 路由 `/admin/projects` + AdminLayout 侧边栏「作品管理」

## 4. 验收

- [x] 4.1 后端构建通过（nest build）
- [x] 4.2 前端构建通过（vue-tsc + vite build）
- [x] 4.3 公开列表仅返回可见作品且排序正确（种子数据验证：隐藏被过滤、sortOrder 降序、techStack JSON 契约）
- [ ] 4.4 管理端创建/编辑/删除生效，隐藏作品前台不可见（接口 401 守卫已验证；UI 全流程待管理员登录后人工验收）
