# 个人技术博客

基于 [Astro](https://astro.build/) 构建的个人技术博客,使用 Markdown 写作,Git 推送自动部署到 GitHub Pages。

## 功能特性

- Markdown / MDX 写作支持
- 代码块语法高亮(Shiki)+ 复制按钮
- 深色 / 浅色主题切换(支持系统跟随)
- 标签页与文章列表
- 全文搜索(Pagefind)
- RSS 订阅
- Sitemap 与 SEO/OG 卡片
- 响应式设计

## 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:4321/your-repo-name/`(根据 `astro.config.mjs` 中的 `base` 配置)。

## 写作

在 `src/content/blog/` 下创建 Markdown(`.md`)或 MDX(`.mdx`)文件,Frontmatter 格式:

```markdown
---
title: '文章标题'
description: '文章摘要'
pubDate: 'Jul 06 2026'
tags: ['标签1', '标签2']
heroImage: '../../assets/your-image.jpg'  # 可选
draft: false  # 可选,默认 false
---

正文内容...
```

## 部署到 GitHub Pages

### 1. 创建仓库并推送

```bash
git remote add origin git@github.com:your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

### 2. 配置仓库 Settings

进入仓库 Settings → Pages → Source,选择 **GitHub Actions**。

### 3. 修改 astro.config.mjs

把 `site` 与 `base` 替换为你的实际值:

```javascript
site: 'https://your-username.github.io',  // 替换 your-username
base: '/your-repo-name',                   // 替换 your-repo-name
```

### 4. 推送即部署

每次 push 到 `main` 分支,GitHub Actions 会自动构建并部署。访问 `https://your-username.github.io/your-repo-name/` 查看站点。

## 技术栈

- [Astro](https://astro.build/) v7 - 静态站点生成器
- [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) - MDX 支持
- [@astrojs/rss](https://docs.astro.build/en/guides/integrations-guide/rss/) - RSS 订阅
- [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) - 站点地图
- [Pagefind](https://pagefind.app/) - 静态全文搜索
- [Shiki](https://shiki.matsu.io/) - 代码语法高亮

## 项目结构

```
src/
├── components/       # 组件(Header、Footer、Search、ThemeToggle 等)
├── content/blog/     # 博客文章 Markdown/MDX
├── layouts/          # 文章布局
├── pages/            # 路由页面
│   ├── blog/         # 博客列表与详情
│   ├── tags/         # 标签云与单标签页
│   ├── about.astro   # 关于页
│   └── rss.xml.js    # RSS 端点
├── styles/           # 全局样式
└── consts.ts         # 站点常量(标题、描述)
```

## License

MIT
