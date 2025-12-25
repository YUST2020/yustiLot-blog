# 技术选型方案

## 1. 项目概述
本项目旨在构建一个现代化的个人全栈网站，包含前台展示与后台管理系统。
项目采用 **Nuxt 4** 作为核心全栈框架，利用其 SSR 能力处理前台渲染，Nitro 引擎处理后台 API。
为了满足在线管理需求，博客文章与用户信息将存储于数据库中。

## 2. 核心技术栈

### 2.1 全栈框架
- **Framework**: [Nuxt 4](https://nuxt.com/)
- **Core**: Vue 3.5+ (Composition API, `<script setup>`)
- **Language**: TypeScript (严格类型模式)
- **Build Tool**: Vite

### 2.2 UI 与 样式
- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn-vue](https://www.shadcn-vue.com/)
  - 自定义组件，无原生样式包袱。
- **Icons**: [Nuxt Icon](https://nuxt.com/modules/icon) (SVG 首选) / Emoji (备选)
- **Admin UI**: 复用 Shadcn-vue 组件构建管理后台。

### 2.3 后端与数据库
- **Server Engine**: Nitro (Nuxt 内置)
- **Database**: **SQLite**
  - 轻量、单文件、易备份。
  - 存储用户信息 (管理员) 和博客文章数据。
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
  - 类型安全，开发体验极佳。
- **Authentication**: `nuxt-auth-utils` 或自定义 Session 方案
  - 实现管理员登录鉴权。

### 2.4 博客系统 (自建 CMS)
- **Storage**: 数据库存储 (SQLite `posts` 表)。
- **Editor**: Markdown 编辑器 (如 MdEditorV3 或基于 Tiptap 定制)。
- **Renderer**: 
  - 前台使用 Markdown 解析器 (如 `markdown-it` 或 Nuxt Content 的 Transformer) 将数据库中的 Markdown 渲染为 HTML。

## 3. 开发规范
- **TypeScript**: 接口以 `I` 开头 (如 `IUser`, `IPost`)。
- **Vue**: `<script setup lang="ts">`。
- **Style**: 扁平化、现代化，严格还原设计。
