# 番剧（Anime）记录模块技术方案文档

## 1. 需求概述
为项目增加一个番剧记录模块，支持后台管理（增删查改）和前台双视图展示。

## 2. 数据库设计 (Drizzle Schema)
在 `server/database/schema.ts` 中新增 `animes` 表。

| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `integer` | Primary Key, Auto Increment | 唯一标识 |
| `title` | `text` | Not Null | 番剧名称 |
| `coverImage` | `text` | Not Null | 封面图片 URL (建议宽高比 225:300) |
| `rating` | `integer` | Not Null (0-10) | 评分，0-10分制，对应 5 颗星 |
| `review` | `text` | - | 一句话感想 |
| `releaseYear` | `integer` | Not Null (>= 2005) | 上映年份 |
| `releaseQuarter` | `integer` | Not Null (1, 4, 7, 12) | 上映季度 |
| `createdAt` | `integer` | Default Now | 记录创建时间 |
| `updatedAt` | `integer` | Default Now | 记录更新时间 |

## 3. 接口文档 (API Design)

### 3.1 前台公共接口 (Public)
*   **GET `/api/animes`**
    *   **描述**：获取番剧列表，支持分页和排序。
    *   **参数**：
        *   `page`: 页码 (默认 1)
        *   `limit`: 每页数量 (默认 12)
        *   `sortBy`: 排序字段 (`releaseDate` 按上映时间, `rating` 按评分)
        *   `sortOrder`: 排序顺序 (`desc` 倒序, `asc` 正序)
    *   **返回**：
        ```json
        {
          "data": [
            { "id": 1, "title": "葬送的芙莉莲", "coverImage": "...", "rating": 10, "releaseYear": 2023, "releaseQuarter": 10, ... }
          ],
          "pagination": { "total": 100, "page": 1, "totalPages": 9 }
        }
        ```

### 3.2 后台管理接口 (Admin - 需鉴权)
*   **GET `/api/admin/animes`**: 获取所有番剧列表（分页）。
*   **POST `/api/admin/animes`**: 新增番剧。
*   **GET `/api/admin/animes/:id`**: 获取指定番剧详情。
*   **PUT `/api/admin/animes/:id`**: 修改番剧信息。
*   **DELETE `/api/admin/animes/:id`**: 删除番剧。

## 4. 前端功能设计

### 4.1 后台管理 (Admin)
*   **列表页**：展示番剧名称、评分、上映时间，支持搜索和分页。
*   **表单页**：
    *   **封面图**：输入 URL。
    *   **评分**：5 颗星组件（支持半星，分值 0-10）。
    *   **上映时间**：年份（2005 之后）和季度（1, 4, 7, 12月）选择框。
    *   **感想**：一句话评论。

### 4.2 前台展示 (Frontend)
*   **背景**：集成 `app/components/ParticleBackground.vue`。
*   **视图切换与排序**：
    1.  **时间线视图 (默认)**：按上映年份和季度分组展示。
    2.  **评分视图**：按评分高低排列。
    3.  **排序控制**：所有视图均支持 **正序 (Ascending)** 和 **倒序 (Descending)** 切换。
*   **布局**：紧凑网格布局，封面比例 225:300。
*   **分页**：支持服务端分页加载。
