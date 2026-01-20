# AI Agent 开发准则 (Project Development Guidelines)

为了确保代码质量、风格一致性以及良好的用户体验，请在开发过程中严格遵守以下规则。

## 1. 样式与适配 (UI/UX & Responsiveness)
*   **深色/浅色模式 (Dark/Light Mode)**:
    *   所有页面和组件**必须**同时适配深色模式和浅色模式。
    *   使用 Tailwind CSS 的 `dark:` 前缀类名来处理深色模式样式（例如：`bg-white dark:bg-zinc-950`）。
    *   避免硬编码颜色值，尽量使用 CSS 变量或 Tailwind 的语义化颜色类（如 `bg-background`, `text-foreground`）。
*   **移动端优先 (Mobile-First)**:
    *   页面布局必须是响应式的。默认编写移动端样式，使用 `md:`, `lg:` 等断点来适配桌面端。
    *   确保在小屏幕设备上表格可滚动、模态框可完全显示、按钮易于点击。

## 2. 组件使用规范 (Component Usage)
*   **Shadcn-vue 优先**:
    *   对于**表单 (Form)**、**表格 (Table)**、**弹窗 (Dialog)**、**按钮 (Button)** 等基础 UI 元素，**必须**优先使用项目 `app/components/ui` 目录下的 shadcn-vue 组件。
    *   仅在 shadcn-vue 组件无法满足需求时，才考虑手写原生 HTML 元素或引入其他库。
*   **一致性**:
    *   保持组件的 Props 和插槽使用方式与现有的 shadcn-vue 组件一致。

## 3. 代码注释 (Code Comments)
*   **中文注释**: 代码中的所有注释必须使用**中文**编写。
*   **精简原则**:
    *   **拒绝废话**: 不要为自解释的代码写注释（例如：不要写 `// 获取用户列表` 在 `getUserList()` 函数上方）。
    *   **重点标注**: 仅在以下情况添加注释：
        *   复杂的业务逻辑或算法步骤。
        *   特殊的边界条件处理 (Edge cases)。
        *   不得不使用的 Hack 手段及其原因。
        *   复杂的正则或不易理解的配置项。
