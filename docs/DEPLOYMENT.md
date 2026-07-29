# 部署指南

> 前后端分离重构（C0–C10）完成后的部署说明。

## 架构

```
用户浏览器 ──HTTPS──> Nginx ──┬──> 静态资源（frontend/dist）
                               └──reverse proxy /api──> NestJS（backend，:3000）
                                                          │
                                                          └──> MySQL（106.15.67.226:3306/blog）
```

## 一、后端部署（backend/）

### 1. 环境变量
复制 `.env.example` 为 `.env` 并填入真实值：
```bash
cd backend
cp .env.example .env
# 编辑 DATABASE_URL / JWT_SECRET / CORS_ORIGIN / PORT
```
当前云库配置：
- `DATABASE_URL="mysql://admin:HA4NyK8zNKPtXwcE@106.15.67.226:3306/blog"`
- `JWT_SECRET`（生产请改为强随机串）
- `CORS_ORIGIN`（前端域名，如 `https://your-domain.com`）

### 2. 安装与生成 Prisma Client
```bash
npm install
npx prisma generate
```

### 3. 启动
- 开发：`npm run start:dev`
- 生产构建：`npm run build` → `npm run start:prod`（监听 PORT，默认 3000）

推荐用 PM2 守护：
```bash
pm2 start npm --name blog-backend -- run start:prod
```

## 二、前端部署（frontend/）

### 1. 配置 API 地址
开发期用 Vite proxy（`vite.config.ts`）转发 `/api` 到 `localhost:3000`。
生产期由 Nginx 反代 `/api`，前端无需改配置（`baseURL: '/api'`）。

### 2. 构建静态资源
```bash
cd frontend
npm install
npm run build   # 产物在 frontend/dist/
```

### 3. 托管
将 `frontend/dist/` 整目录交给 Nginx 作为静态根。

## 三、Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态资源
    root /var/www/yustilot-blog/frontend/dist;
    index index.html;

    # SPA history 模式回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反代到后端
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源长缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 四、数据迁移（首次部署）

数据已通过 C5 迁移至云 MySQL（见 `scripts/migrate-sqlite-to-mysql.mjs`）。
如需重新迁移：
```bash
cd scripts
npm install
node migrate-sqlite-to-mysql.mjs   # 幂等，会先清空再导入
node verify.mjs                    # 校验
```

## 五、首次管理员

`users` 表已有从 SQLite 迁移的真实管理员（bcrypt 哈希）。用原密码即可登录。
若库为空，首次用 `username=admin` 登录会自动建号。

## 六、本地开发联调

```bash
# 终端1：后端
cd backend && npm run start:dev   # :3000

# 终端2：前端
cd frontend && npm run dev        # :5173，/api 自动代理到 :3000
```
