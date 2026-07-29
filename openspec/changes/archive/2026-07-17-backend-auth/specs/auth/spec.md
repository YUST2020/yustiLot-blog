## ADDED Requirements

### Requirement: 鉴权模块实现就绪

`backend/` MUST 实现完整的 auth 模块，满足现有 `auth` spec 的全部场景：
- `AuthController` 暴露 `POST /api/auth/login`、`POST /api/auth/logout`、`GET /api/auth/me`。
- `AuthService` 实现密码校验、首次 admin 自动建号、JWT 签发。
- `JwtStrategy` + `JwtAuthGuard` 作为全局守卫；公开接口用 `@Public()` 豁免。
- `JwtModule` 注册，secret/expiresIn 来自环境变量。

#### Scenario: 全局守卫与公开豁免
- **WHEN** 未带 token 访问 /api/auth/login（POST）
- **THEN** 不被守卫拦截，可正常登录

#### Scenario: me 接口受保护
- **WHEN** 未带 token 访问 GET /api/auth/me
- **THEN** 返回 401
