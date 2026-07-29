## 1. DTO 与 Service

- [x] 1.1 CreatePostDto/UpdatePostDto（class-validator，tags 为 string 保 JSON 字符串契约）
- [x] 1.2 PostsService：listPublic/getBySlugPublic/listAdmin/getById/create/update/remove
- [x] 1.3 resolvePublishedAt 复刻现有逻辑（isPublished&&无值→now；有值→parse；否则 null）
- [x] 1.4 tags 原样存取（不做 parse/stringify）

## 2. 控制器与模块

- [x] 2.1 PostsController（@Public）：GET /api/posts 裸数组、GET /api/posts/:slug 仅已发布
- [x] 2.2 PostsAdminController：GET/POST/GET:id/PUT:id/DELETE:id /api/admin/posts（全局守卫保护）
- [x] 2.3 PostsModule 注册双控制器 + service
- [x] 2.4 AppModule 引入 PostsModule

## 3. 验收

- [x] 3.1 TypeScript 编译零错误
- [x] 3.2 创建已发布文章 → publishedAt 自动设置；tags 保持 JSON 字符串
- [x] 3.3 创建草稿 → publishedAt 为 null
- [x] 3.4 公开列表返回裸数组（Array=true），仅含已发布
- [x] 3.5 公开详情 slug 查询；访问草稿 404
- [x] 3.6 管理列表含草稿；无 token 访问管理 401
