# Auth Specification

> 鉴权能力：管理员登录、登出、获取当前登录态。
> 功能与现有 Nuxt 版本一致；实现从 Cookie Session 改为 JWT。

## Purpose

为后台管理接口（`/api/admin/**`）提供身份鉴权，仅支持**管理员**单一角色。前台公开接口不需鉴权。
## Requirements
### Requirement: 管理员登录

系统 SHALL 提供 `POST /api/auth/login` 接口，校验用户名密码后签发 JWT。

入参 body：`{ username: string, password: string }`。任一缺失返回 `400`。
校验流程：
1. 按 `username` 查询用户。
2. 用户存在 → 用 bcrypt 比对密码，失败返回 `401`。
3. 用户不存在 → 进入「首次建号」分支（见下）。
4. 成功 → 签发 JWT（payload `{ sub, username, name }`），返回 `{ user: { id, username, name }, token }`。

#### Scenario: 正常登录
- **WHEN** 已存在的用户提交正确用户名与密码
- **THEN** 返回 200、用户信息与 JWT token

#### Scenario: 凭据缺失
- **WHEN** 请求 body 缺少 username 或 password
- **THEN** 返回 400

#### Scenario: 密码错误
- **WHEN** 用户存在但密码不匹配
- **THEN** 返回 401

### Requirement: 首次管理员自动建号

当 `users` 表为空（无任何记录）且登录用户名为 `admin` 时，系统 SHALL 自动创建首位管理员（`name='Admin'`），哈希其密码后直接签发 JWT 返回。
该逻辑 MUST 仅在表空且 username === `admin` 时触发；其他用户名在表空时返回 401。

#### Scenario: 表空时用 admin 首次登录
- **WHEN** users 表无记录，且提交 username=`admin`（任意密码）
- **THEN** 创建 name=`Admin` 的用户，bcrypt 哈希密码，返回 200 与 token

#### Scenario: 表空时用非 admin 用户名
- **WHEN** users 表无记录，但 username 不是 `admin`
- **THEN** 返回 401

### Requirement: 管理员登出

系统 SHALL 提供 `POST /api/auth/logout` 接口，返回 `{ success: true }`。
JWT 为无状态令牌，登出在前端表现为丢弃本地 token；后端接口保留以兼容现有前端调用契约。

#### Scenario: 登出
- **WHEN** 调用 POST /api/auth/logout
- **THEN** 返回 200 与 `{ success: true }`

### Requirement: 获取当前登录用户

系统 SHALL 提供 `GET /api/auth/me` 接口（**新增**，现有 Nuxt 版通过 cookie session 隐式提供）。
请求 MUST 携带有效 JWT（`Authorization: Bearer <token>`）。有效 → 返回 `{ user: { id, username, name } }`；无效/缺失 → 401。
该接口供前端 SPA 初始化时恢复登录态。

#### Scenario: 携带有效 token
- **WHEN** 请求携带有效 JWT
- **THEN** 返回 200 与对应用户信息

#### Scenario: 未携带或携带无效 token
- **WHEN** 请求无 Authorization 头或 token 无效/过期
- **THEN** 返回 401

### Requirement: 管理接口鉴权守卫

所有 `/api/admin/**` 接口 MUST 经鉴权守卫保护；未携带有效 JWT 返回 401。
公开接口（`/api/posts`、`/api/posts/:slug`、`/api/animes`、`/api/auth/login`、`/api/auth/logout`）不受守卫保护。

#### Scenario: 未授权访问管理接口
- **WHEN** 未携带或携带无效 token 访问任意 /api/admin/** 接口
- **THEN** 返回 401，不暴露任何业务数据

### Requirement: 密码哈希兼容

系统 MUST 使用 bcryptjs（10 轮 salt）哈希与校验密码。
从 SQLite 迁移过来的现有密码哈希 MUST 能被直接校验通过，**不得要求用户重置密码**。

#### Scenario: 迁移后的旧密码可登录
- **WHEN** 用户使用迁移前相同的明文密码登录
- **THEN** bcrypt 比对旧哈希成功，登录通过

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

