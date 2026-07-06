# 个人技术博客设计方案

- **创建日期**: 2026-07-06
- **状态**: 已确认
- **类型**: 设计文档 (Spec)

## 1. 背景与目标

构建一个个人技术博客站点,核心诉求:

1. **简单写作**: 用 Markdown 编写,编辑器(如 VSCode)中直接创作
2. **方便发布**: Git 推送后自动构建并发布到 GitHub Pages
3. **零运维**: 无后端、无数据库,纯静态站点,免费托管

## 2. 技术选型

### 决策结果

| 维度 | 选择 | 理由 |
|------|------|------|
| 框架 | Astro | 内容驱动站点首选,纯静态产物,加载极快 |
| 语言 | TypeScript | 类型安全,生态成熟 |
| 主题 | Blogster 社区主题微调 | 现代简洁,功能完备,启动快 |
| 内容格式 | Markdown + MDX | 支持 React/Vue 组件嵌入 |
| 包管理 | pnpm | 速度快、磁盘占用小 |
| 部署 | GitHub Pages | 免费,单仓库 + GitHub Actions |
| 域名 | `https://<username>.github.io/<repo>` | 默认域名,零配置 |

### 备选方案(已评估未采用)

- **VitePress**: 偏文档场景,博客标准功能(标签/分类/RSS)需手动实现
- **Next.js (SSG)**: 生态最灵活但偏重,博客功能配置成本高于 Astro
- **Hugo/Hexo**: 非 JS/TS 生态,与用户技术偏好不符

## 3. 系统架构

### 整体架构

```
[本地写作]               [版本控制]              [CI/CD]              [托管]
Markdown/MDX 文件  →  git push 到 main   →  GitHub Action   →  GitHub Pages
   (src/content/blog/)                       构建为静态 HTML        (gh-pages)
```

- **零运行时**: 站点构建产物为纯静态 HTML/CSS/JS
- **Islands 架构**: 默认零 JS,交互组件按需 hydrate

### 目录结构

```
/
├── src/
│   ├── content/
│   │   └── blog/              # 博客文章 Markdown/MDX
│   │       └── *.md
│   ├── components/            # 组件(导航、Footer、卡片等)
│   ├── layouts/               # 布局
│   ├── pages/
│   │   ├── index.astro        # 首页(文章列表)
│   │   ├── blog/[...slug].astro   # 文章详情动态路由
│   │   ├── tags/[tag].astro       # 标签页
│   │   └── rss.xml.js             # RSS 订阅
│   ├── styles/                # 全局样式
│   └── content.config.ts      # Content Collections schema
├── public/                    # 静态资源(图片等)
├── astro.config.mjs           # Astro 配置
├── .github/workflows/
│   └── deploy.yml             # GitHub Pages 自动部署
└── package.json
```

## 4. 核心组件设计

### 4.1 内容管理 (Content Collections)

- 文章存放于 `src/content/blog/`
- 通过 `src/content.config.ts` 定义 schema,提供 Frontmatter 字段类型安全
- Frontmatter 字段:
  - `title`: 标题(必填)
  - `description`: 摘要
  - `pubDate`: 发布日期
  - `updatedDate`: 更新日期
  - `tags`: 标签数组
  - `draft`: 是否草稿(可选)

### 4.2 路由与页面

| 路由 | 文件 | 功能 |
|------|------|------|
| `/` | `pages/index.astro` | 首页,文章列表(分页) |
| `/blog/[...slug]` | `pages/blog/[...slug].astro` | 文章详情页 |
| `/tags` | `pages/tags/index.astro` | 标签云 |
| `/tags/[tag]` | `pages/tags/[tag].astro` | 单标签下的文章列表 |
| `/rss.xml` | `pages/rss.xml.js` | RSS 订阅源 |
| `/sitemap-index.xml` | `@astrojs/sitemap` 自动生成 | 站点地图 |

### 4.3 关键功能实现

| 功能 | 方案 |
|------|------|
| 代码块增强 | Astro 内置 Shiki:行号、语法高亮、复制按钮 |
| Mermaid 图表 | `@mermaid-js/mermaid` 集成 |
| 深色/浅色主题 | Blogster 自带,支持手动切换与系统跟随 |
| 标签/分类 | Content Collections + 动态路由 |
| 目录 TOC | 从 Markdown headings 自动生成 |
| RSS 订阅 | `@astrojs/rss` 官方集成 |
| Sitemap | `@astrojs/sitemap` 官方集成 |
| SEO/OG 卡片 | 文章 Frontmatter 配置 + 通用 SEO 组件 |
| 全文搜索 | Pagefind(构建时索引,零运行时成本) |

## 5. 写作与发布流程

### 写作流程

1. 在 `src/content/blog/` 下新建 `my-post.md`
2. 文件头部 Frontmatter 定义标题、日期、标签、摘要等
3. 本地 `pnpm dev` 预览
4. 满意后 `git commit` & `git push`

### 发布流程(GitHub Pages 单仓库)

1. 仓库 Settings → Pages → Source 设为 GitHub Actions
2. 添加 `.github/workflows/deploy.yml`(Astro 官方模板)
3. `astro.config.mjs` 中设置 `site` 与 `base` 路径
4. 每次 push 到 `main` 分支 → 自动构建 → 部署到 Pages

### Frontmatter 示例

```markdown
---
title: "我的第一篇博客"
description: "博客系统的简介与使用"
pubDate: 2026-07-06
tags: ["随笔", "博客"]
draft: false
---

正文内容...
```

## 6. 范围边界

### 包含(MVP)

- Markdown/MDX 写作支持
- Blogster 主题微调
- 代码块增强(Shiki 行号、高亮、复制)
- 深色/浅色主题切换
- 标签页与文章列表
- 文章详情页(含 TOC)
- RSS 订阅
- Sitemap 与基础 SEO/OG
- Pagefind 全文搜索
- GitHub Pages 自动部署

### 不包含(YAGNI)

- ❌ 评论系统(如 Giscus)
- ❌ 访问统计(如 Umami/Plausible)
- ❌ 多语言 i18n
- ❌ 多作者支持
- ❌ 后端服务/数据库
- ❌ 付费内容/订阅

未来如有需要可单独拆分新 spec 进行扩展。

## 7. 测试策略

- **构建验证**: CI 中执行 `pnpm build` 确保无构建错误
- **链接检查**: 使用 `astro check` 校验内部链接与类型
- **本地预览**: `pnpm preview` 在本地验证构建产物
- **手动验收**: 部署后访问站点确认关键页面(首页、文章、标签、RSS)正常

## 8. 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| GitHub Pages 流量限制(每月 100GB) | 个人博客流量通常远低于此,无需特殊处理 |
| Blogster 主题与最新版 Astro 不兼容 | 锁定 Astro 版本,升级前测试 |
| Pagefind 索引未及时更新 | 在 CI 构建流水线中执行 `pagefind` 索引步骤 |

## 9. 后续步骤

1. 进入实施规划阶段(writing-plans skill)
2. 拆分任务清单:
   - 项目初始化与依赖安装
   - Blogster 主题集成与基础配置
   - Content Collections schema 定义
   - 关键页面与组件开发
   - 插件集成(RSS/Sitemap/Pagefind)
   - GitHub Actions 部署配置
   - 首篇文章与本地验证
   - 推送上线
