## ADDED Requirements

### Requirement: 端到端联调通过

前后端同时启动后，MUST 通过端到端联调验证完整链路：
- 公开页面正确加载后端数据（/、/blog、/animes）。
- 登录成功后后台可访问并能完成文章/番剧 CRUD。
- 深浅色切换全站生效。
- tags JSON 字符串契约、时间 ISO 显示正确。

#### Scenario: 完整链路可用
- **WHEN** 启动 backend:3000 + frontend:5173
- **THEN** 前台页面渲染真实数据，登录后台可 CRUD
