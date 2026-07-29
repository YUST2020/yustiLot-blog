## Why

前端（C6–C9）与后端（C1–C5）已全部实现并通过单独编译/接口测试。本 change 做最后的端到端联调：同时启动前后端，验证完整链路（登录→CRUD→页面渲染→深浅色→数据一致），并补全部署相关配置与文档收尾。

## What Changes

- 端到端联调：启动 backend（3000）+ frontend（5173），验证关键链路。
- 验证项：公开页面数据加载、登录、后台 CRUD（文章/番剧）、深浅色切换、tags 契约、时间显示。
- 部署配置：frontend 生产构建（npm run build）、backend 生产启动、Nginx 反代示例文档。
- 文档收尾：更新 REFACTOR_PROGRESS.md 全部完成、补 README 启动说明。
- 暂不删除旧 Nuxt 代码（保留为兜底，待用户确认上线后单独清理）。

## Capabilities

### New Capabilities
无。

### Modified Capabilities
- `architecture`: 落地部署相关 requirement（生产构建、反代）。

## Impact

- **代码**：可能修复联调中发现的小问题。
- **文档**：更新进度看板与 README。
- **回滚**：本 change 不破坏现有实现。
