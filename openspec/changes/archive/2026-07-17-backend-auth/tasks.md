## 1. Auth 模块骨架

- [x] 1.1 创建 auth 模块目录（controller/service/strategies/dto/guard）
- [x] 1.2 LoginDto（username/password 必填，class-validator）
- [x] 1.3 JwtPayload 接口与 JwtStrategy（从 Bearer token 提取校验）

## 2. 业务逻辑

- [x] 2.1 AuthService.login：查用户→bcrypt 校验；表空且 username=admin 自动建号（name=Admin）
- [x] 2.2 JWT 签发（payload {sub, username, name}），返回 { user: {id,username,name}, token }
- [x] 2.3 复用 C1 的 hashPassword/comparePassword（10 轮，兼容旧库）

## 3. 守卫与路由

- [x] 3.1 JwtAuthGuard（全局，@Public() 豁免）
- [x] 3.2 @Public() 装饰器（common/decorators/public.decorator.ts）
- [x] 3.3 AuthController：POST /login（@Public）、POST /logout（@Public）、GET /me（受保护）
- [x] 3.4 AuthModule 注册 JwtModule.registerAsync（secret/expiresIn 来自 env）
- [x] 3.5 AppModule 注册 AuthModule + APP_GUARD 全局 JwtAuthGuard

## 4. 验收

- [x] 4.1 TypeScript 编译零错误
- [x] 4.2 login 缺参数 → 400
- [x] 4.3 首次 admin 登录 → 200 + 自动建号 + token（users 表新增 bcrypt $2b$10$ 哈希记录）
- [x] 4.4 me 无 token → 401；带 token → 200 返回用户信息
- [x] 4.5 logout → { success: true }
