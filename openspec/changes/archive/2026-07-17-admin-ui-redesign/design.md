# 后台 UI 重构设计语言

> 本文档是后台 UI 重构的设计依据，所有后台页面与组件 MUST 遵循。

## 1. 设计原则

**现代简约 SaaS 风**（对标 Linear / Vercel / Stripe Dashboard）：
- 克制：低饱和配色、细边框、柔和阴影，避免强装饰。
- 清晰：高对比文字、明确层级、信息密度适中偏高。
- 一致：所有控件遵循同一套 token 与尺寸约定。
- 专业：留白有序、对齐严格、微交互克制（hover/transition 200ms）。

## 2. Token 使用规范（全部基于现有 HSL 变量）

所有颜色 MUST 使用语义 token，**禁止硬编码色值**（深浅色自动适配的前提）。

| 用途 | token | 说明 |
|:---|:---|:---|
| 页面底 | `bg-background` | 主背景 |
| 卡片/面板 | `bg-card` + `border border-border` | 卡片容器 |
| 悬浮面板 | `bg-popover` | 弹层、下拉 |
| 主文字 | `text-foreground` | 标题、正文 |
| 次文字 | `text-muted-foreground` | 辅助、说明 |
| 主操作 | `bg-primary text-primary-foreground` | 主按钮、激活态 |
| 次操作 | `bg-secondary text-secondary-foreground` | 次按钮 |
| 边框 | `border-border` | 分隔线、卡片边 |
| 输入框 | `border-input bg-background` | 表单控件边 |
| 危险 | `bg-destructive text-destructive-foreground` | 删除等 |

圆角统一：卡片/按钮 `rounded-lg`，小元素 `rounded-md`，徽标 `rounded-full`。
阴影：卡片用 `shadow-sm`，悬浮用 `shadow-md`，避免大阴影。

## 3. 布局规范（AdminLayout）

```
┌─────────────────────────────────────────────────┐
│ 侧边栏 256px  │  顶栏 64px                       │
│               ├──────────────────────────────────┤
│ ▣ 仪表盘      │                                  │
│ ▤ 文章管理    │   主内容区（router-view）         │
│ Tv 番剧管理   │   padding: 24-32px               │
│               │                                  │
│ ─────────     │                                  │
│ 退出登录      │                                  │
└───────────────┴──────────────────────────────────┘
```

- 侧边栏：`bg-card border-r border-border`，宽 `w-64`，固定。
- 导航项：`px-3 py-2 rounded-md text-sm font-medium`；默认 `text-muted-foreground hover:bg-secondary hover:text-foreground`；激活 `bg-primary/10 text-primary font-medium`。
- 顶栏：`h-16 border-b border-border bg-background/80 backdrop-blur`，含页面标题/主题切换/头像。
- 移动端：侧边栏抽屉化（lg 以下隐藏，汉堡触发）。

## 4. 表单控件规范（Native + Tailwind）

**核心**：用原生 `<input>/<textarea>/<select>` + Tailwind 类，基于 token，定义统一的视觉。

### 4.1 文本输入（Input）
```html
<input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
  text-foreground placeholder:text-muted-foreground/60
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring
  disabled:cursor-not-allowed disabled:opacity-50 transition-colors" />
```
- 高度 `h-10`（40px），字号 `text-sm`，内边距 `px-3`。
- 边框 `border-input`，聚焦 `ring-2 ring-ring` + 边框转 `border-ring`。
- placeholder 弱化 `text-muted-foreground/60`。

### 4.2 文本域（Textarea）
同 Input，但 `min-h-[80px] py-2 resize-y`。

### 4.3 下拉选择（Select）
native `<select>` + 同 Input 样式 + 右侧 chevron 图标（用背景或 lucide 叠加）。

### 4.4 复选框（Checkbox）
native `<input type="checkbox">` + `h-4 w-4 rounded border-input text-primary focus:ring-ring`。

### 4.5 标签（Label）
`text-sm font-medium text-foreground`。

### 4.6 表单分组
`space-y-2`（label 与控件间），分组间 `space-y-6` 或 grid。

## 5. 按钮规范

统一按钮样式（替代裸 button）：
- **主按钮**：`bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors`
- **次按钮/outline**：`border border-input bg-background hover:bg-secondary text-foreground rounded-md px-4 py-2 text-sm font-medium`
- **ghost**：`hover:bg-secondary text-foreground rounded-md px-3 py-2 text-sm`
- **danger**：`text-destructive hover:bg-destructive/10`
- **图标按钮**：`h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-secondary`
- 尺寸：默认 `h-10`，sm `h-9`，icon `h-9 w-9`。

## 6. 卡片规范

```html
<div class="rounded-lg border border-border bg-card shadow-sm">
  <div class="p-6"><!-- header --></div>
  <div><!-- content --></div>
</div>
```

## 7. 表格规范

```html
<div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-muted/40 border-b border-border">
      <tr class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <th class="px-4 py-3">列名</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-border">
      <tr class="hover:bg-muted/30 transition-colors">
        <td class="px-4 py-3 text-foreground">值</td>
      </tr>
    </tbody>
  </table>
</div>
```
- 表头：`bg-muted/40`、`text-xs uppercase`、`text-muted-foreground`。
- 行：`hover:bg-muted/30`、`divide-y divide-border`。
- 单元格 `px-4 py-3`。

## 8. 状态徽标（Badge）

native span + token，按语义：
- 已发布/成功：`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`
- 草稿/待定：`bg-amber-500/10 text-amber-600 dark:text-amber-400`
- 信息：`bg-primary/10 text-primary`
- 中性：`bg-secondary text-secondary-foreground`
统一：`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium`。

## 9. 工具栏规范

```html
<div class="flex items-center gap-3">
  <!-- 搜索 -->
  <div class="relative">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input class="... pl-9" />
  </div>
  <div class="ml-auto flex items-center gap-2"><!-- 操作按钮 --></div>
</div>
```

## 10. 分页规范

`上一页 [1/共N页] 下一页`，按钮 outline 风格，禁用态 `opacity-50 cursor-not-allowed`。

## 11. 动效

- 过渡统一 `transition-colors duration-200`。
- 弹窗/下拉进入用 `transition-opacity`，不做夸张位移。
- 表格行 hover 即时反馈。

## 12. 深浅色

所有上述 token 在 `:root`/`.dark` 两套变量下均有定义，**只要不硬编码颜色，深浅色自动适配**。需人工确认的少数语义色（如 emerald/amber 徽标）已带 `dark:` 变体。

## 13. 不重构的部分

- 前台（公开页面）保持不变。
- 后端 API 不变。
- 数据模型不变。
