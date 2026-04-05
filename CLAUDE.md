# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

通用 AI 助手前端，支持 RAG 检索、知识库管理、后台管理等功能。后端地址：https://github.com/tianshiyang/assistant-backend-ai

## 常用命令

```bash
npm run dev      # 启动开发服务器 (端口 9000)
npm run build    # 构建生产版本 (vue-tsc -b && vite build)
npm run lint     # ESLint 检查并自动修复
npm run format   # Prettier 格式化 src/ 目录
```

## 架构概览

### 路由结构

项目使用三个路由模块组合：
- **loginRouter** (`/login`) - 登录注册
- **homeRouter** (`/`) - 主布局，包含对话页(`/chat`)、知识库(`/dataset`)、文档列表
- **backendRouter** (`/backend`) - 后台管理布局，包含销售、客户、商品、订单、历史记录、文档处理等功能

### 核心目录

```
src/
├── api/
│   ├── module/          # API 请求函数，按业务模块划分
│   └── types/           # TypeScript 类型定义
├── components/          layout.vue, backendLayout.vue, 公共组件
├── views/
│   ├── chat/            AI 对话页面
│   ├── dataset/         知识库管理
│   ├── document/        文档列表
│   ├── login/           登录注册
│   └── backend/         后台管理模块
├── stores/              Pinia 状态管理
├── utils/
│   ├── request.ts       Axios 封装，统一的请求/响应处理
│   ├── stream.ts        SSE 流式请求封装 (使用 @microsoft/fetch-event-source)
│   └── eventBus.ts      Mitt 事件总线
└── router/              路由配置
```

### 关键技术点

1. **流式对话**：AI 对话使用 SSE (Server-Sent Events) 实现流式响应，通过 `src/utils/stream.ts` 封装
2. **API 模块化**：请求函数和类型定义分离，类型放在 `api/types/`，请求放在 `api/module/`
3. **双布局系统**：`layout.vue` (AI助手) 和 `backendLayout.vue` (后台管理)，可通过右上角按钮切换
4. **自动导入**：使用 unplugin-auto-import，Vue 和 Vue Router API 无需手动导入
5. **组件自动注册**：Ant Design Vue 组件通过 unplugin-vue-components 自动注册

### 开发代理

开发环境 API 代理到 `http://127.0.0.1:5000`，路径匹配 `^/api`

### 代码风格

- 使用 Prettier 格式化，配置见 `.prettierrc.json`
- ESLint 使用 Vue3 + TypeScript 规则，配置见 `.eslintrc.cjs`
- 路径别名 `@/` 指向 `src/`
