# 重构进度看板

> 本文件是前后端分离重构（C0–C10，共 11 个 change）的总览，与 `openspec/` 契约互补：
> - **OpenSpec**：spec 描述功能契约，change 描述变更 delta（机器可校验）。
> - **本看板**：人类视角的总进度、依赖关系、里程碑。
>
> 约定：每完成（archive）一个 change，同步更新本看板状态。

## 数据库信息

- 云 MySQL：`106.15.67.226:3306`，库 `blog`，版本 **5.7.40**。
- 凭据存放于 `backend/.env`（被 gitignore，不进版本库）；`backend/.env.example` 提供模板。
- **注意**：版本为 5.7（非 8.x）。Prisma MySQL provider 兼容 5.7；JSON 类型/DATETIME(3)/utf8mb4_bin 均支持。

## 依赖关系图

```
C0  setup-monorepo-openspec      地基
 │
 ├─► C1  backend-foundation       后端脚手架
 │    ├─► C2  backend-auth        鉴权模块
 │    ├─► C3  backend-posts       文章模块
 │    └─► C4  backend-animes      番剧模块
 │         │
 │         └─► C5  data-migration 数据迁移
 │
 ├─► C6  frontend-foundation      前端地基（与后端并行）
 │    └─► C7  frontend-auth       前端鉴权层
 │         └─► C8  frontend-public 前台页面
 │              └─► C9  frontend-admin 后台页面
 │                   └─► C10 integration-deployment 联调+清理
```

## Change 总表

| ID | Change | 所属 Spec | 状态 | 说明 |
|:---|:---|:---|:---|:---|
| C0 | setup-monorepo-openspec | project-layout | ✅ 已完成 | monorepo 目录 + .gitignore + 本看板 |
| C1 | backend-foundation | architecture | ✅ 已完成 | NestJS + Prisma + MySQL 5.7 接入 |
| C2 | backend-auth | auth | ✅ 已完成 | JWT、login/logout/me、首次 admin 建号 |
| C3 | backend-posts | posts | ✅ 已完成 | 文章公开+管理 CRUD、publishedAt 规则 |
| C4 | backend-animes | animes | ✅ 已完成 | 番剧公开+管理、分页/排序/搜索 |
| C5 | data-migration | data-migration | ✅ 已完成 | SQLite→MySQL 迁移与校验 |
| C6 | frontend-foundation | frontend、architecture | ✅ 已完成 | Vite + Tailwind v4 token + UI 迁移 |
| C7 | frontend-auth | frontend、auth | ✅ 已完成 | LoginDialog + axios 拦截器 |
| C8 | frontend-public | frontend | ✅ 已完成 | /、/blog、/blog/:slug、/animes、/about |
| C9 | frontend-admin | frontend | ✅ 已完成 | 仪表盘 + posts/animes CRUD |
| C10 | integration-deployment | architecture | ✅ 已完成 | 端到端联调、部署、清理旧代码 |

## 状态图例

- ⬜ 待开始
- 🔄 进行中
- ✅ 已完成（已 archive）

## 验收里程碑

- **M1（C1–C4 完成）**：后端全部接口可用，用 curl/Postman 验证契约对齐。
- **M2（C5 完成）**：数据迁移完成，三表行数、时间、tags 校验通过，旧密码可登录。
- **M3（C6–C9 完成）**：前端全部页面迁移完成，深浅色与交互与旧站一致。
- **M4（C10 完成）**：端到端联调通过，旧 Nuxt 代码可清理。
