## 1. DTO 与 Service

- [x] 1.1 CreateAnimeDto/UpdateAnimeDto（rating 0-10、releaseQuarter 1-12 校验）
- [x] 1.2 buildOrderBy 复刻排序：releaseDate→[year,quarter]、rating→[rating]、其他→[createdAt]
- [x] 1.3 listPublic：pageSize 默认12上限100、page 默认1、返回分页对象
- [x] 1.4 listAdmin：pageSize 默认10、search 按 title contains、返回分页对象（total 基于筛选）
- [x] 1.5 requireValidId：id 非整数抛 400；不存在抛 404

## 2. 控制器与模块

- [x] 2.1 AnimesController（@Public）：GET /api/animes 分页对象
- [x] 2.2 AnimesAdminController：GET（带search）/POST/GET:id/PUT:id/DELETE:id /api/admin/animes
- [x] 2.3 AnimesModule 注册双控制器 + service
- [x] 2.4 AppModule 引入 AnimesModule

## 3. 验收

- [x] 3.1 TypeScript 编译零错误
- [x] 3.2 公开列表返回分页对象（items/total/page/pageSize/totalPages），默认 pageSize=12
- [x] 3.3 releaseDate 排序按 year 再 quarter；rating 排序正确
- [x] 3.4 pageSize 传 999 钳制为 100
- [x] 3.5 管理搜索按 title 过滤；id 非法 400；不存在 404
- [x] 3.6 PUT 更新生效（updatedAt 刷新）；DELETE 返回 {success:true}
