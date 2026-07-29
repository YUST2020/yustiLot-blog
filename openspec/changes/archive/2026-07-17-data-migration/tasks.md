## 1. 脚本工程

- [x] 1.1 scripts/ 初始化（package.json）+ 安装 mysql2、@libsql/client
- [x] 1.2 migrate-sqlite-to-mysql.mjs：清空目标表→读 SQLite→写 MySQL→对齐自增
- [x] 1.3 verify.mjs：行数 + 时间 ISO + tags 逐字 三重校验

## 2. 契约处理

- [x] 2.1 时间换算：epoch 秒 ×1000 → UTC 分量 'YYYY-MM-DD HH:MM:SS.mmm'（规避 5.7 不接受 ISO Z）
- [x] 2.2 tags 原样字符串搬运（不 JSON.parse）
- [x] 2.3 password 原样 bcrypt 哈希
- [x] 2.4 mysql2 连接设 timezone:'Z'（修复 8 小时偏移）

## 3. 验收

- [x] 3.1 迁移成功：users 1 / posts 1 / animes 55
- [x] 3.2 verify 全部通过：11 通过 0 失败（行数一致、时间 ISO 等值、tags 逐字）
- [x] 3.3 自增对齐：users=2 / posts=2 / animes=62
- [x] 3.4 后端 Prisma 读取时间与 SQLite UTC 一致（anime#61 对照验证）
- [x] 3.5 密码哈希迁移后真实哈希生效（C2 测试密码登录失败=符合预期）
