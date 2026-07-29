## Why

后端地基（C1）就绪后，鉴权是第一个业务模块。前台/后台分离后，登录从 Cookie Session 改为 JWT；管理接口（C3/C4）依赖 `JwtAuthGuard` 守卫。本 change 实现 auth 全部契约，是后续管理接口的前置依赖。

## What Changes

- 实现 `AuthModule`：`AuthController`（login/logout/me）、`AuthService`（登录校验、首次建号、JWT 签发）、`JwtStrategy`、`JwtAuthGuard`。
- `POST /api/auth/login`：校验密码；表空且 username=`admin` 自动建号（name=`Admin`）；签发 JWT；返回 `{ user, token }`。
- `POST /api/auth/logout`：返回 `{ success: true }`（JWT 无状态，前端丢弃 token）。
- `GET /api/auth/me`：JwtAuthGuard 守卫，返回当前用户信息。
- `JwtAuthGuard` 声明为全局守卫，公开接口用 `@Public()` 装饰器豁免。
- DTO：`LoginDto`（username/password 必填，校验失败 400）。
- 复用 C1 的 `hashPassword/comparePassword`（10 轮 bcrypt，与旧库兼容）。

## Capabilities

### New Capabilities

无新 capability。落地现有 `auth` spec 的全部 requirement。

### Modified Capabilities

- `auth`: 首次落地全部 auth requirement（登录、首次建号、登出、me、守卫、bcrypt 兼容）。

## Impact

- **代码**：新增 `src/modules/auth/`（controller/service/strategy/guard/dto/module）+ `src/common/decorators/public.decorator.ts`。
- **配置**：消费 `.env` 的 `JWT_SECRET`、`JWT_EXPIRES_IN`（C1 已定义）。
- **数据库**：只读 `users` 表；首次 admin 登录时写入一条记录。
- **回滚**：删除 auth 模块文件 + 移除 AppModule 中的引用。
