# 个人技术博客 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Astro 官方 blog 模板搭建一个 Markdown 驱动、Git 推送自动部署到 GitHub Pages 的个人技术博客。

**Architecture:** Astro 静态站点生成器 + Content Collections 管理文章 + Astro 官方 blog 模板 + npm 包管理 + GitHub Actions CI/CD。构建产物为纯静态 HTML,部署到 GitHub Pages 默认域名。

**Tech Stack:** Astro (最新版) / TypeScript / Markdown+MDX / npm / GitHub Actions / GitHub Pages

## Global Constraints

- 包管理器: npm (用户本地已有,不使用 pnpm/yarn)
- 框架: Astro 最新稳定版
- 主题起点: Astro 官方 blog 模板 (`npm create astro@latest -- --template blog`)
- 部署: GitHub Pages 单仓库,默认域名 `https://<username>.github.io/<repo>`
- Node 版本: >= 18.14.1 (Astro 最低要求)
- 不包含评论系统、访问统计、i18n、多作者、后端服务
- 提交粒度: 每个 Task 结束提交一次
- 提交信息语言: 英文 conventional commits 格式 (feat/fix/chore/docs)

---

### Task 1: 初始化 Astro 项目与依赖安装

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/pages/index.astro` (Astro 默认生成)

**Interfaces:**
- Produces: 可运行的 Astro 项目骨架,`pnpm dev` 可启动本地预览

- [ ] **Step 1: 检查 Node 与 pnpm 版本**

Run: `node --version && pnpm --version`
Expected: Node >= 18.14.1, pnpm >= 8.x

如果 pnpm 未安装,执行: `npm install -g pnpm`

- [ ] **Step 2: 使用 Astro CLI 初始化项目**

在项目根目录执行:

```bash
pnpm create astro@latest .
```

交互式选项选择:
- Template: Minimal
- Install dependencies: Yes (使用 pnpm)
- TypeScript: Yes
- Strictest TypeScript config: Yes

- [ ] **Step 3: 验证项目可运行**

Run: `pnpm dev`
Expected: 本地服务启动,浏览器访问 `http://localhost:4321` 看到 Astro 默认页面

按 Ctrl+C 停止服务

- [ ] **Step 4: 配置 .gitignore**

确认项目根目录 `.gitignore` 文件包含以下内容(若不完整则补全):

```gitignore
# build output
dist/
.output/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production

# macOS-specific files
.DS_Store

# jetbrains setting folder
.idea/

# Astro
.astro/
```

- [ ] **Step 5: 初始化 Git 仓库并首次提交**

```bash
git init
git add .
git commit -m "chore: init astro project"
```

---

### Task 2: 安装 Blogster 主题与基础配置

**Files:**
- Modify: `package.json` (新增主题依赖)
- Modify: `astro.config.mjs` (site/base 配置)
- Create: `src/content.config.ts` (Content Collections schema)
- Create: `src/content/blog/` (文章目录)

**Interfaces:**
- Produces: Blogster 主题集成完成,Content Collections schema 定义文章 Frontmatter 字段
- Produces: `CollectionEntry<'blog'>` 类型供后续页面使用

- [ ] **Step 1: 安装 Blogster 主题依赖**

```bash
pnpm add astro-blogster
```

- [ ] **Step 2: 配置 astro.config.mjs**

修改 `astro.config.mjs` 为:

```javascript
import { defineConfig } from 'astro/config';
import blogster from 'astro-blogster';

// 仓库地址: https://github.com/<username>/<repo>
// Pages 域名: https://<username>.github.io/<repo>
export default defineConfig({
  site: 'https://<username>.github.io',
  base: '/<repo>',
  integrations: [blogster()],
});
```

注意: `<username>` 与 `<repo>` 需替换为实际值(后续 Task 8 部署时确认)

- [ ] **Step 3: 创建 Content Collections schema**

创建 `src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 4: 创建文章目录与首篇示例文章**

创建目录 `src/content/blog/`

创建示例文章 `src/content/blog/hello-world.md`:

```markdown
---
title: "Hello World"
description: "博客第一篇文章,介绍站点搭建"
pubDate: 2026-07-06
tags: ["随笔"]
draft: false
---

# Hello World

欢迎来到我的技术博客!

这是用 Astro 搭建的第一篇文章。
```

- [ ] **Step 5: 启动 dev 验证主题加载**

Run: `pnpm dev`
Expected: 访问 `http://localhost:4321/<repo>/` 看到 Blogster 主题样式,首页列出 Hello World 文章

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "feat: integrate blogster theme and content collections"
```

---

### Task 3: 安装核心插件 (RSS / Sitemap / MDX)

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Create: `src/pages/rss.xml.js`
- Create: `src/content.config.ts` (扩展支持 MDX)

**Interfaces:**
- Produces: `/rss.xml` 端点提供 RSS 订阅源
- Produces: `/sitemap-index.xml` 自动生成站点地图
- Produces: MDX 文件可作为博客文章

- [ ] **Step 1: 安装插件依赖**

```bash
pnpm add @astrojs/rss @astrojs/sitemap @astrojs/mdx
```

- [ ] **Step 2: 更新 astro.config.mjs 集成插件**

修改 `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import blogster from 'astro-blogster';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://<username>.github.io',
  base: '/<repo>',
  integrations: [
    blogster(),
    mdx(),
    sitemap(),
  ],
});
```

注意: RSS 不需要 integration,通过端点文件实现

- [ ] **Step 3: 创建 RSS 端点**

创建 `src/pages/rss.xml.js`:

```javascript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  return rss({
    title: 'My Tech Blog',
    description: '个人技术博客',
    site: context.site,
    items: posts
      .sort((a, b) => b.data.pubDate - a.data.pubDate)
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
      })),
  });
}
```

- [ ] **Step 4: 扩展 Content Collections 支持 MDX**

修改 `src/content.config.ts` 的 loader pattern(已是 `**/*.{md,mdx}`,无需改动,确认即可)

- [ ] **Step 5: 验证插件工作**

Run: `pnpm dev`
Expected:
- 访问 `http://localhost:4321/<repo>/rss.xml` 看到 RSS XML 输出
- 访问 `http://localhost:4321/<repo>/sitemap-index.xml` 看到 sitemap

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "feat: add rss, sitemap, mdx integrations"
```

---

### Task 4: 配置代码块增强 (Shiki 行号与复制按钮)

**Files:**
- Modify: `astro.config.mjs` (Shiki 配置)
- Create: `src/components/CopyCodeButton.astro` (复制按钮组件)
- Modify: Blogster 文章布局 (注入复制按钮脚本)

**Interfaces:**
- Produces: 文章代码块显示行号、语法高亮、复制按钮

- [ ] **Step 1: 在 astro.config.mjs 中配置 Shiki**

修改 `astro.config.mjs`,在 defineConfig 中添加 markdown 配置:

```javascript
import { defineConfig } from 'astro/config';
import blogster from 'astro-blogster';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://<username>.github.io',
  base: '/<repo>',
  integrations: [
    blogster(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
```

- [ ] **Step 2: 创建复制按钮组件**

创建 `src/components/CopyCodeButton.astro`:

```astro
---
---

<button
  class="copy-code-button"
  type="button"
  aria-label="复制代码"
  data-copy-code
>
  <span class="copy-icon" aria-hidden="true">📋</span>
  <span class="copy-text">复制</span>
</button>

<style>
  .copy-code-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: inherit;
    cursor: pointer;
    font-size: 0.75rem;
    opacity: 0;
    transition: opacity 0.2s;
  }

  pre:hover .copy-code-button {
    opacity: 1;
  }

  .copy-code-button.copied {
    background: rgba(34, 197, 94, 0.2);
  }
</style>

<script>
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-code]');
    if (!button) return;

    const pre = button.closest('pre');
    if (!pre) return;

    const code = pre.querySelector('code');
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code.innerText);
      button.classList.add('copied');
      button.querySelector('.copy-text').textContent = '已复制';
      setTimeout(() => {
        button.classList.remove('copied');
        button.querySelector('.copy-text').textContent = '复制';
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  });
</script>
```

- [ ] **Step 3: 在文章布局中注入复制按钮**

定位 Blogster 主题的文章布局文件 (通常在 `src/layouts/PostLayout.astro` 或主题包内)

在布局文件中,渲染 `<pre>` 块后添加客户端脚本注入复制按钮:

```astro
<script>
  // 为所有 pre>code 块添加复制按钮
  function injectCopyButtons() {
    document.querySelectorAll('pre:not([data-copy-button-injected])').forEach((pre) => {
      pre.setAttribute('data-copy-button-injected', 'true');
      pre.style.position = 'relative';
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', '复制代码');
      button.setAttribute('data-copy-code', '');
      button.className = 'copy-code-button';
      button.innerHTML = '<span aria-hidden="true">📋</span><span class="copy-text">复制</span>';
      pre.appendChild(button);
    });
  }

  // 初始注入 + 视图切换时重新注入
  injectCopyButtons();
  document.addEventListener('astro:page-load', injectCopyButtons);
</script>

<style is:global>
  .copy-code-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: inherit;
    cursor: pointer;
    font-size: 0.75rem;
    opacity: 0;
    transition: opacity 0.2s;
  }
  pre:hover .copy-code-button {
    opacity: 1;
  }
  .copy-code-button.copied {
    background: rgba(34, 197, 94, 0.2);
  }
</style>
```

注意: 如果 Blogster 主题已自带复制按钮,此 Task 跳过 Step 2-3,只需 Step 1 的 Shiki 配置即可

- [ ] **Step 4: 验证代码块增强**

修改 `src/content/blog/hello-world.md`,在文末添加代码块测试:

````markdown
```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```
````

Run: `pnpm dev`
Expected: 文章详情页代码块有语法高亮、hover 时显示复制按钮、点击复制后显示"已复制"

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "feat: enhance code blocks with shiki and copy button"
```

---

### Task 5: 集成 Pagefind 全文搜索

**Files:**
- Modify: `package.json` (pagefind dev 依赖)
- Modify: `astro.config.mjs` (构建后 hook 执行索引)
- Create: `src/components/Search.astro` (搜索组件)
- Modify: 首页或导航布局 (放置搜索组件)

**Interfaces:**
- Produces: 站点顶部有搜索框,可全文检索文章内容

- [ ] **Step 1: 安装 Pagefind**

```bash
pnpm add -D pagefind
```

- [ ] **Step 2: 配置构建后执行 pagefind 索引**

修改 `astro.config.mjs`,添加 vite 构建后 hook:

```javascript
import { defineConfig } from 'astro/config';
import blogster from 'astro-blogster';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'node:child_process';

export default defineConfig({
  site: 'https://<username>.github.io',
  base: '/<repo>',
  integrations: [
    blogster(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  vite: {
    build: {
      afterBuild: () => {
        execSync('pagefind --site dist', { stdio: 'inherit' });
      },
    },
  },
});
```

注意: 如果 `vite.build.afterBuild` hook 不工作,改为在 `package.json` 的 build script 中追加: `"build": "astro build && pagefind --site dist"`

- [ ] **Step 3: 创建搜索组件**

创建 `src/components/Search.astro`:

```astro
---
---

<div id="search" class="search-container">
  <input
    type="search"
    id="search-input"
    placeholder="搜索文章..."
    class="search-input"
  />
  <div id="search-results" class="search-results"></div>
</div>

<link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
<script src="/pagefind/pagefind-ui.js"></script>

<script>
  import '/pagefind/pagefind-ui.js';

  const search = new PagefindUI({
    element: '#search-results',
    showImages: false,
  });

  const input = document.getElementById('search-input');
  input?.addEventListener('input', (e) => {
    search.triggerSearch(e.target.value);
  });
</script>

<style>
  .search-container {
    position: relative;
    max-width: 400px;
  }
  .search-input {
    width: 100%;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 4px;
    background: var(--bg-color, transparent);
    color: inherit;
  }
  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-color, white);
    border: 1px solid var(--border-color, #ccc);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
  }
</style>
```

- [ ] **Step 4: 在导航布局中放置搜索组件**

定位 Blogster 的 Header/导航布局文件 (通常 `src/components/Header.astro` 或 `src/layouts/BaseLayout.astro`)

在合适位置引入:

```astro
---
import Search from '../components/Search.astro';
---

<!-- 导航栏中插入 -->
<Search />
```

- [ ] **Step 5: 验证搜索功能**

Run: `pnpm build && pnpm preview`
Expected:
- 构建过程中看到 pagefind 索引输出
- 访问预览站点,搜索框输入关键词能搜到 Hello World 文章

注意: Pagefind 仅在构建产物中工作,`pnpm dev` 模式不可用

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "feat: integrate pagefind full-text search"
```

---

### Task 6: 编写 About 页面与示例文章

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/content/blog/astro-getting-started.md`

**Interfaces:**
- Produces: `/about` 页面介绍博主
- Produces: 至少 2 篇示例文章用于验证列表/详情/标签功能

- [ ] **Step 1: 创建 About 页面**

创建 `src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const title = '关于我';
const description = '个人技术博客 - 关于博主';
---

<BaseLayout title={title} description={description}>
  <article class="prose">
    <h1>关于我</h1>
    <p>
      你好,我是一名软件开发者,热爱技术分享。
      这个博客记录我在编程路上的学习与思考。
    </p>
    <h2>技术栈</h2>
    <ul>
      <li>前端: TypeScript / React / Astro</li>
      <li>后端: Node.js / Python</li>
      <li>工具: Git / Docker / VSCode</li>
    </ul>
    <h2>联系方式</h2>
    <ul>
      <li>GitHub: <a href="https://github.com/<username>">@<username></a></li>
      <li>Email: your@email.com</li>
    </ul>
  </article>
</BaseLayout>
```

注意: `<username>` 与 BaseLayout 路径需根据 Blogster 主题实际结构调整

- [ ] **Step 2: 创建第二篇示例文章**

创建 `src/content/blog/astro-getting-started.md`:

```markdown
---
title: "Astro 入门指南"
description: "介绍如何使用 Astro 搭建静态博客"
pubDate: 2026-07-06
tags: ["Astro", "前端"]
draft: false
---

## 为什么选择 Astro

Astro 是一个现代化的静态站点生成器,专为内容驱动站点设计。

### 主要特性

- 零 JS 默认输出
- Islands 架构
- 支持多种 UI 框架
- 内置 Markdown/MDX 支持

## 代码示例

```typescript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.com',
});
```

## 总结

Astro 是搭建博客的绝佳选择。
```

- [ ] **Step 3: 验证页面与文章**

Run: `pnpm dev`
Expected:
- 访问 `/about` 看到 About 页面
- 首页列出 2 篇文章
- 标签页能筛选 "Astro" 标签的文章

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add about page and sample posts"
```

---

### Task 7: 配置 GitHub Actions 自动部署

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs` (确认 site/base 配置)
- Modify: `package.json` (确认 build script 包含 pagefind)
- Modify: `README.md` (添加部署说明)

**Interfaces:**
- Produces: push 到 main 分支自动构建并部署到 GitHub Pages

- [ ] **Step 1: 确认 astro.config.mjs 的 site 与 base**

向用户确认 GitHub 用户名与仓库名,替换 `<username>` 与 `<repo>` 占位符

```javascript
// 假设用户名为 yangxin,仓库名为 blog
site: 'https://yangxin.github.io',
base: '/blog',
```

- [ ] **Step 2: 确认 package.json build script**

修改 `package.json` 的 scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build && pagefind --site dist",
    "preview": "astro preview",
    "astro": "astro"
  }
}
```

- [ ] **Step 3: 创建 GitHub Actions workflow**

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build with Astro
        run: pnpm build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: 更新 README.md 部署说明**

创建/修改 `README.md`:

```markdown
# 个人技术博客

基于 Astro 构建的个人技术博客。

## 本地开发

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

访问 http://localhost:4321/<repo>/

## 写作

在 \`src/content/blog/\` 下创建 Markdown 文件,Frontmatter 格式:

\`\`\`markdown
---
title: "文章标题"
description: "摘要"
pubDate: 2026-07-06
tags: ["标签1"]
draft: false
---

正文...
\`\`\`

## 部署

push 到 main 分支即自动部署到 GitHub Pages。

仓库 Settings → Pages → Source 需设为 GitHub Actions。
```

- [ ] **Step 5: 验证 workflow 语法**

Run: `pnpm build`
Expected: 本地构建成功,dist 目录生成,pagefind 索引输出

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "ci: add github pages deploy workflow"
```

---

### Task 8: 推送上线与最终验证

**Files:** (无新文件,仅操作)

**Interfaces:** 完成博客上线,可访问

- [ ] **Step 1: 在 GitHub 创建仓库**

提示用户在 GitHub 创建新仓库 (假设名 `blog`,public)

- [ ] **Step 2: 关联远程仓库并推送**

```bash
git remote add origin git@github.com:<username>/blog.git
git branch -M main
git push -u origin main
```

注意: `<username>` 替换为实际值

- [ ] **Step 3: 配置 GitHub Pages Source**

提示用户访问仓库 Settings → Pages → Source,选择 "GitHub Actions"

- [ ] **Step 4: 触发并监控 Action**

提示用户访问仓库 Actions 页签,查看 deploy workflow 运行状态

Expected: build 与 deploy 任务均成功

- [ ] **Step 5: 访问线上站点验证**

访问 `https://<username>.github.io/blog/`

Expected:
- 首页正常加载,显示 2 篇文章
- 文章详情页代码块高亮、复制按钮工作
- 搜索框可用
- `/about` 页面正常
- `/rss.xml` 与 `/sitemap-index.xml` 可访问
- 深色/浅色主题切换正常

- [ ] **Step 6: 最终提交(如有线上发现的问题修复)**

```bash
git add .
git commit -m "fix: address issues found in production verification"
git push
```

---

## 验收清单

- [ ] `pnpm dev` 本地预览正常
- [ ] `pnpm build` 构建无报错
- [ ] 首页文章列表展示正常
- [ ] 文章详情页代码块语法高亮 + 复制按钮
- [ ] 标签页过滤功能
- [ ] 深色/浅色主题切换
- [ ] 全文搜索可用
- [ ] RSS 与 sitemap 端点可访问
- [ ] About 页面正常
- [ ] GitHub Actions 部署成功
- [ ] 线上站点可访问且功能完整
