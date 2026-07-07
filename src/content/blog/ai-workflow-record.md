---
title: '个人技术博客搭建 - AI 工作流全过程记录'
description: '记录一次完整的 AI 辅助开发过程，从需求分析到代码交付，展示 AI 在结构化工作流中的运作方式'
pubDate: '2026-07-06'
heroImage: '../../assets/blog-placeholder-2.jpg'
tags: ['AI', '工作流', 'Astro']
---

## 什么是 AI 工作流？

这次对话不是一个"你说一句，AI 回一句"的简单问答。它是一套**有结构、有流程、有检查点**的工作方法。整个过程中，AI 不是即兴发挥，而是在一套严格的规则（system prompt）和多个技能模块（Skill）的约束下运作的。

你可以把 Skill 理解为 AI 的"工作手册"——每个 Skill 告诉 AI 在这个阶段应该做什么、不能做什么、怎么判断完成。AI 在开始时先检查"有没有合适的 Skill 可用"，有的话就必须按 Skill 的流程走，不能跳过。

---

## 第一部分：对话全景

整个对话经历了 **5 个阶段**：

```
需求分析 → 技术选型 → 设计方案 → 撰写计划 → 执行交付
(brainstorming)          (writing-plans)  (subagent-driven)
```

每个阶段都由一个特定的 Skill 驱动，AI 不能在上一个阶段完成前跳到下一个阶段。

---

## 第二阶段：需求分析（brainstorming 阶段）

### 用户的第一句话

> "我想创建一个个人技术博客站点，要求可以简单地编写博客，并且可以方便地发布，我应该用什么技术栈"

### AI 做了什么

AI 收到这条消息后，根据系统 prompt 中的规则——"在开始任何任务前，先检查是否有合适的 Skill 可用"——发现 `brainstorming` Skill 匹配"创建博客"这个创意工作，于是**立即调用 brainstorming Skill**，而不是直接回答"用 Astro"。

brainstorming Skill 展开后，给 AI 下达了严格的指令：

1. 先了解项目当前状态
2. 一次只问一个问题，逐步收敛需求
3. 提出 2-3 个方案对比，带推荐理由
4. **在用户批准设计之前，绝对不能写任何代码**（HARD-GATE）
5. 设计通过后写出设计文档，再交给 writing-plans

### 问题 1：写作与发布流程

AI 问："你希望博客的写作与发布流程是怎样的？"

为什么问这个？因为"简单写 + 方便发"对于不同人意味着完全不同的东西。有人觉得 WordPress 后台写就是简单，有人觉得 git push 就是简单。AI 不能假设，必须问清楚。

**用户选择**：Markdown + Git 推送自动部署，部署到 GitHub Pages

这个选择决定了后续所有技术方向——不需要后端、不需要数据库、纯静态站点。

### 问题 2：技术栈偏好与功能需求

AI 同时问了两个问题：
- 偏好哪种技术栈？→ 用户选"前端框架（JS/TS 生态）"
- 需要哪些功能？→ 用户选"博客标准功能 + 代码块增强 + 主题与交互"

同步问两个是因为它们互不依赖，可以并行处理，节省时间。

### 方案对比

基于用户的选择，AI 提出了 3 个方案：

| 方案 | 定位 | 适合场景 |
|------|------|---------|
| Astro | 内容驱动站点首选 | 写技术博客为主，偶尔需要交互组件 |
| VitePress | 文档/笔记风格 | 偏技术笔记，不需要传统博客标签/分类 |
| Next.js | 最灵活但最重 | 未来想扩展为全栈应用 |

**用户选择**：Astro

### 问题 3：主题、域名、仓库结构

AI 继续问了 3 个问题：
- 主题怎么来？→ 用社区主题微调
- 部署域名？→ GitHub Pages 默认域名
- 仓库结构？→ 单仓库

### 问题 4：社区主题选择 + 评论与统计

**用户选择**：Blogster 主题，不要评论和统计

### 设计确认

AI 给出了完整的设计方案概览：
- 技术栈：Astro + Blogster 主题 + Markdown/MDX
- 部署：GitHub Pages 单仓库 + GitHub Actions
- 功能清单：代码增强、深色模式、标签、搜索、RSS、SEO
- 不做什么：不要评论、统计、多语言、后端

**用户说**："确认，继续下一步"

### 这一阶段的 AI 行为规则

- **HARD-GATE**：用户批准前绝对不能写代码。brainstorming Skill 里明确写了"Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it."
- **一次一个问题**：Skill 规定"One question at a time"，避免用一堆问题轰炸用户
- **多选优先**：Skill 说"Multiple choice preferred"，选择题比开放式问题更容易回答

---

## 第三阶段：设计方案文档化

AI 把确认的设计写成正式文档，保存到 `docs/superpowers/specs/2026-07-06-personal-tech-blog-design.md`。

文档包含：
- 背景与目标
- 技术选型及备选方案
- 系统架构（目录结构、路由设计）
- 核心组件设计（Content Collections、页面路由、功能实现方案）
- 写作与发布流程
- 范围边界（MVP 包含什么、不包含什么）
- 测试策略
- 风险与缓解

然后 AI 做了一次**自检（Spec Self-Review）**：检查有没有占位符（TBD/TODO）、内部矛盾、范围过大、歧义。自检通过后，请用户审阅。

---

## 第四阶段：撰写实施计划（writing-plans 阶段）

用户说"开始实现"后，AI 调用 `writing-plans` Skill。

writing-plans Skill 的核心理念：

> "假设执行计划的工程师对代码库一无所知，品味堪忧。把每个步骤都写清楚，让他们只需要照做就行。"

### 计划的结构

计划共 8 个 Task，每个 Task 包含：
- **文件清单**：要创建/修改哪些文件
- **接口定义**：这个 Task 消费什么、产出什么（让后续 Task 知道依赖关系）
- **步骤**：每步一个具体操作（2-5 分钟），包含实际代码和命令
- **验证**：每步预期的命令输出

### 计划的自检

writing-plans Skill 要求写完后做一次自检（Self-Review）：

1. **Spec 覆盖**：design 文档里的每个功能，计划里都有对应的 Task 吗？
2. **占位符扫描**：有没有"TBD""TODO""后续实现"这类模糊表述？——不允许
3. **类型一致性**：Task 3 定义的函数名和 Task 7 调用的是同一个吗？

### 任务总览

| Task | 内容 |
|------|------|
| 1 | 初始化 Astro 项目 |
| 2 | 集成 Blogster 主题与 Content Collections |
| 3 | 安装 RSS/Sitemap/MDX 插件 |
| 4 | 代码块增强（Shiki + 复制按钮） |
| 5 | Pagefind 全文搜索 |
| 6 | About 页面与示例文章 |
| 7 | GitHub Actions 部署配置 |
| 8 | 推送上线与最终验证 |

### 执行方式选择

writing-plans 的结尾要求 AI 提供两种执行方式：

1. **Subagent 驱动**：每个 Task 派一个独立的"子 AI"执行，主 AI 负责协调和审查
2. **当前会话执行**：在当前对话中一步一步执行

**用户选择**：Subagent 驱动

---

## 第五阶段：执行交付（subagent-driven-development 阶段）

### Subagent 是什么？

Subagent（子代理）是一个独立的 AI 实例。它被派发去执行一个具体任务，带着这个任务需要的全部上下文（项目背景、文件路径、具体步骤、验证命令），但它**不知道对话的历史**，也**不知道其他 subagent 在做什么**。

这样做的好处：
- 每个 subagent 的上下文干净，不会被之前的信息干扰
- 可以并行执行独立的 Task
- 主 AI 只负责协调，不会被大量实现细节淹没

### Task 1：初始化项目（主会话执行）

**为什么 Task 1 在主会话执行？** 因为初始化涉及交互式 CLI 命令和网络问题，需要灵活应对，不适合交给 subagent。

#### 遇到问题 1：pnpm 未安装

AI 运行 `node --version && pnpm --version`，发现 pnpm 不存在。

计划原本写的是用 pnpm 作为包管理器。但用户本地没装 pnpm。

**AI 的处理**：问了用户两个问题：
1. pnpm 怎么处理？→ 用户选"改用 npm"
2. Astro CLI 是交互式的，怎么处理？→ 用户选"非交互式初始化"

然后 AI 更新了计划文档中所有 `pnpm` 命令为 `npm`。

#### 遇到问题 2：GitHub 直连失败

`npm create astro@latest . --template blog` 失败——网络无法访问 GitHub。

**AI 的尝试路径**：
1. 直接 `npm create astro` → 失败（GitHub 拉取模板失败）
2. `git clone https://github.com/withastro/astro.git` → 失败（HTTP2 错误）
3. `git clone https://gitcode.com/gh_mirrors/as/astro.git` → **成功**

从克隆的仓库中复制 `examples/blog/` 目录到项目根目录，得到完整的 Astro 官方 blog 模板。

#### 发现：模板已内置大量功能

AI 检查了模板的文件结构后发现，Astro 官方 blog 模板已经包含了：
- RSS 订阅
- Sitemap
- MDX 支持
- Content Collections（含 schema 定义）
- About 页面
- 5 篇示例文章
- SEO/OG 卡片
- 响应式设计

这意味着原计划中的 Task 2、3、6 大部分内容已经被覆盖了。

**AI 的调整**：更新计划文档，将 Blogster 主题改为 Astro 官方 blog 模板，重新组织剩余任务为：
- Task A：站点基础配置 + schema 扩展
- Task B：代码块增强
- Task C：深色模式
- Task D：标签页
- Task E：Pagefind 搜索
- Task F：部署配置

#### 安装依赖，验证可运行

```bash
npm install    # 安装 334 个包
npm run dev    # 启动成功，http://localhost:4321/
```

Task 1 提交：`chore: init astro blog project from official template`

### Task A：站点配置 + Schema 扩展（Subagent 执行）

AI 派发了一个 `general_purpose_task` subagent，给它下达了详细指令：

**给了 subagent 什么**：
- 项目路径
- 5 个具体任务（修改 astro.config.mjs、consts.ts、content.config.ts、index.astro、about.astro）
- 每个任务要改什么、改成什么
- 验证步骤（运行 `npm run dev` 确认无报错）
- 约束条件（不安装新依赖、先 Read 再 Edit、不提交 git）

**Subagent 执行了什么**：
1. `astro.config.mjs`：site 改为 `https://your-username.github.io`，base 改为 `/your-repo-name`
2. `src/consts.ts`：标题改为 "My Tech Blog"，描述改为中文
3. `src/content.config.ts`：schema 中新增 `tags: z.array(z.string()).default([])`
4. `src/pages/index.astro`：替换默认 Astro 介绍文案为中文欢迎语
5. `src/pages/about.astro`：替换 Lorem ipsum 占位为真实的"关于我"内容

**Subagent 报告**：dev server 启动成功，无报错。

**主 AI 验证**：运行 `npm run build`，8 个页面构建成功。提交。

### Task B：代码块增强（Subagent 执行）

**给了 subagent 什么**：
- 在 `astro.config.mjs` 中配置 Shiki（github-dark 主题）
- 在 `BlogPost.astro` 中注入复制按钮的脚本和样式
- 复制按钮实现：hover 时显示，点击复制到剪贴板，显示"已复制"2 秒

**Subagent 执行了什么**：
1. 读取 `astro.config.mjs`，在 `integrations` 后新增 `markdown.shikiConfig`
2. 读取 `BlogPost.astro`，在 `</article>` 后注入一段 `<script>` 和 `<style is:global>`
3. 脚本功能：为每个 `<pre>` 标签注入复制按钮，监听 `astro:page-load` 事件，点击复制后切换状态

**Subagent 报告**：dev server 正常，build 通过。

**主 AI 验证**：build 8 页成功。提交。

### Task C+D：深色模式 + 标签页（Subagent 执行，合并在一个 subagent 中）

这是一个较大的 subagent 任务，包含两个独立功能模块。

#### 深色模式实现

**给了 subagent 什么**：
- 在 `global.css` 中新增 `[data-theme="dark"]` 选择器，覆盖颜色变量
- 创建 `ThemeToggle.astro` 组件（☀️/🌙 切换按钮）
- 在 `Header.astro` 中放置切换按钮
- 在 `BaseHead.astro` 中插入防闪烁脚本（FOUC 防护）

**FOUC 是什么？** "Flash of Unstyled Content"——页面加载时先显示浅色，然后 JS 执行后切换深色，产生闪烁。防闪烁的方法是：在 `<head>` 中插入一段 `is:inline` 脚本，在页面渲染前就读取 localStorage 并设置 `data-theme` 属性。

#### 标签页实现

**给了 subagent 什么**：
- 为 5 篇示例文章补充 tags 字段
- 创建 `src/pages/tags/index.astro`（标签云页面）
- 创建 `src/pages/tags/[tag].astro`（单标签文章列表，用 `getStaticPaths` 生成静态路由）
- 在 Header 导航中加入 Tags 链接

**Subagent 报告**：build 成功，13 个页面（新增 4 个单标签页 + 1 个标签云页）。

**主 AI 验证**：build 13 页，提交。

### Task E：Pagefind 全文搜索（Subagent 执行）

**给了 subagent 什么**：
- 安装 `pagefind` 作为 dev 依赖
- 修改 `package.json` 的 build 脚本：`astro build && pagefind --site dist`
- 创建 `Search.astro` 组件
- 在 Header 中放置搜索组件

**Subagent 遇到的关键问题**：Pagefind 的 JS 文件在构建时由 `pagefind` 命令生成到 `dist/pagefind/` 目录下。但 Astro/Vite 在构建阶段会尝试解析 `import('/pagefind/pagefind-ui.js')` 这个路径，而这个文件在 astro build 完成之前不存在。

**Subagent 的解决方案**：在动态 import 语句中加入 `/* @vite-ignore */` 注释，让 Vite 跳过静态解析，保留运行时动态加载。

**验证结果**：Pagefind 索引了 13 个页面、626 个词。搜索功能在 `npm run preview`（构建产物预览）中可用，在 `npm run dev`（开发模式）中不可用——这是预期行为。

### Task F：部署配置（Subagent 执行）

**给了 subagent 什么**：
- 创建 `.github/workflows/deploy.yml`
- 更新 `README.md` 为完整的部署说明

**Subagent 执行**：创建了标准的 GitHub Actions workflow，包含 build 和 deploy 两个 job，使用 `npm ci` 安装依赖。

### 第一次 Bug 修复：链接 404

**用户反馈**："点 blog 直接 404 了"

**问题原因**：`astro.config.mjs` 中配置了 `base: '/your-repo-name'`，这意味着站点部署在子路径下。但所有内部链接都写成了 `/blog`、`/tags`、`/about` 这种绝对路径，浏览器会请求 `/blog` 而非 `/your-repo-name/blog`。

**AI 的修复方案**（派发 subagent）：
1. 创建 `src/utils/path.ts`，提供 `withBase()` 辅助函数，自动拼接 `import.meta.env.BASE_URL`
2. 修改 7 个文件中的所有内部链接

**Subagent 发现的一个关键细节**：`import.meta.env.BASE_URL` 在构建时实际末尾不带斜杠，导致 RSS 链接拼接错误（`your-repo-namerss.xml`）。通过 `withBase` 函数内部做了兼容处理解决。

### 需求变更：首页直接是 Blog

**用户反馈**："不需要 home，直接把 home 设置为 blog"

**AI 的处理**：
1. 把 `blog/index.astro` 的文章列表代码复制到 `index.astro`
2. Header 中去掉 "Home" 和 "Blog" 两个导航项，只保留站点标题、Tags、About
3. 保留 `blog/index.astro` 作为兼容路径

### 第二次 Bug 修复：搜索框没居中

**用户反馈**："搜索文章的搜索框没有居中"

**问题原因**：Header 的 `.social-links` 是 flex 容器，包含搜索框、主题切换按钮、社交图标。但 flex 容器没有设置 `align-items: center`，搜索框作为 `inline-block` 元素在垂直方向上偏上。

**AI 的修复**：
1. `.search-container` 从 `display: inline-block` 改为 `display: inline-flex` + `align-items: center` + `align-self: center`
2. `.social-links` 加 `align-items: center` 和 `gap: 0.25em`

---

## Subagent 派发总结

整个执行过程共派发了 6 个 subagent：

| 次数 | 任务 | 类型 |
|------|------|------|
| 1 | 站点配置 + schema 扩展 | general_purpose_task |
| 2 | 代码块增强 | general_purpose_task |
| 3 | 深色模式 + 标签页 | general_purpose_task |
| 4 | Pagefind 搜索 | general_purpose_task |
| 5 | 部署配置 | general_purpose_task |
| 6 | 链接 404 修复 | general_purpose_task |

**每次派发 subagent，AI 都给了它这些信息**：
- 项目路径（它在哪工作）
- 具体任务（要做什么，精确到每个文件、每行代码）
- 验证步骤（怎么确认做对了）
- 约束条件（不要装新依赖、不要提交 git、保持缩进风格）
- 报告格式（用一段话汇报，不要返回大段代码）

**Subagent 不知道的**：
- 对话历史（它不知道用户之前说了什么）
- 其他 subagent 做了什么
- 整个项目的全局状态

---

## 最终交付

### 已实现功能

- Markdown/MDX 写作（Content Collections 类型安全）
- 代码块语法高亮（Shiki github-dark 主题）+ 复制按钮
- 深色/浅色主题切换（localStorage 持久化 + 系统跟随 + 防 FOUC）
- 标签云 + 单标签文章列表
- Pagefind 全文搜索（13 页 626 词已索引）
- RSS 订阅
- Sitemap
- SEO/OG/Twitter Card
- About 页面
- GitHub Actions 自动部署到 GitHub Pages
- 首页直接显示文章列表
- 搜索框垂直居中

### Git 提交历史

```
7cbafa2 fix: vertically center search box in header
ff2e78a fix: use withBase for all internal links and make blog the homepage
668a0e9 ci: add github pages deploy workflow and update readme
78c8498 feat: integrate pagefind full-text search
88cba89 feat: add dark mode toggle and tag pages
17179f6 feat: add shiki code highlighting and copy button
1a15a83 feat: configure site metadata and extend schema with tags
cd01025 chore: init astro blog project from official template
```

### 用户后续需要做的

1. 替换 `astro.config.mjs` 中的 `your-username` 和 `your-repo-name`
2. 创建 GitHub 仓库并推送代码
3. 仓库 Settings → Pages → Source 选 "GitHub Actions"
4. 访问 `https://your-username.github.io/your-repo-name/`

---

## 附录：AI 被哪些规则约束

### 规则 1：Skill 优先

> "在开始任何任务前，先检查是否有合适的 Skill 可用。如果相关，必须立即调用。"

这条规则决定了 AI 不会直接给答案，而是按流程走。

### 规则 2：不创建不必要的文件

> "永远不要创建文件除非绝对必要。优先编辑已有文件而非创建新文件。不要主动创建文档文件。"

所以 AI 不会主动写 README 或文档，除非 Skill 流程要求或用户明确要求。

### 规则 3：Git 安全

> "永远不要自动提交，除非用户明确要求。不要修改 git config。不要执行破坏性 git 命令。"

### 规则 4：专用工具优先

> "不要用 RunCommand 做文件操作。读文件用 Read，编辑用 Edit，搜索用 Grep/Glob。"

RunCommand 只用于 npm、git 等系统命令。

### 规则 5：并行调用

> "同一响应中最多 5 个并行工具调用。"

读取多个独立文件时，AI 会在同一轮中并行发出 Read 请求。

### 规则 6：代码引用格式

> "所有文件引用必须用可点击的 `file:///` 链接，链接文本用 basename，不包裹反引号。"

### 规则 7：连续执行（来自 subagent-driven-development Skill）

> "不要在每个 Task 之间停下来问用户是否继续。执行所有 Task 直到完成。"

所以 AI 在 6 个 Task 执行期间没有停下问"要继续吗？"

### 规则 8：HARD-GATE（来自 brainstorming Skill）

> "在用户批准设计之前，绝对不要调用任何实施 Skill，不要写任何代码，不要搭建任何项目。"

这是整个流程中最重要的闸门，确保 AI 不会在需求没搞清楚之前就开始写代码。

---

## 附录：三个 Skill 的流程关系

```
用户说"我想做 X"
     │
     ▼
┌─────────────┐
│ brainstorming │  ← 需求分析 + 方案设计
│  HARD-GATE   │     用户批准前不能写代码
└──────┬───────┘
       │ 设计文档
       ▼
┌─────────────┐
│ writing-plans │  ← 拆解任务 + 撰写计划
│   自检       │     无占位符、完整代码、精确命令
└──────┬───────┘
       │ 实施计划
       ▼
┌──────────────────────┐
│ subagent-driven-dev  │  ← 派发 subagent 执行
│   连续执行           │     不在 Task 间暂停
│   Task → Review → ✓  │
└──────────────────────┘
```

每个 Skill 之间是串行的——前一个完成并确认后，才能进入下一个。这就是"结构化工作流"的核心：不是 AI 自由发挥，而是按照预定义的流程和检查点逐步推进。

---

## 后续迭代：内容宽度与排版节奏调整

博客上线后，用户反馈了一个具体的体验问题：

> "该项目的内容宽度太窄了，导致 markdown 流程图很容易换行"

这是一个典型的"真实使用中发现问题 → 进入修复流程"的迭代场景。这次没有走完整的 brainstorming 流程（因为不是创意工作，而是明确的 bug 修复），AI 直接进入了"定位 → 修改 → 验证 → 提交"的紧凑流程。

### 问题定位

AI 先用 `Glob` 和 `Read` 工具浏览项目结构，找到了控制内容宽度的两处 CSS：

```
src/styles/global.css        → main { width: 720px; }
src/layouts/BlogPost.astro    → .prose { width: 720px; }
```

两处都是 720px——对于带流程图、代码块、表格的技术文章来说偏窄。

### 第一轮修改：加宽 + 代码块横向滚动

AI 同步修改了两处宽度，并为 `pre` 标签加了横向滚动：

```css
/* global.css */
main {
    width: 860px;          /* 720 → 860 */
    max-width: calc(100% - 2em);
}
pre {
    padding: 1.5em;
    border-radius: 8px;
    overflow-x: auto;       /* 新增：超宽代码横向滚动而非换行 */
}
```

```astro
/* BlogPost.astro */
.prose {
    width: 860px;           /* 720 → 860 */
    max-width: calc(100% - 2em);
}
```

修改完直接提交并推送：

```
22802dc fix: 加宽正文内容至 860px 并为代码块启用横向滚动
```

### 第二轮修改：排版节奏优化

宽度改完后，用户要求用浏览器实际看一下效果，并指出"间距不太优雅"。这次 AI 调用了两个 Skill：

1. **agent-browser**：自动化浏览器，打开本地页面、截图、提取计算样式
2. **frontend-design**：前端设计审美指引

#### 用 agent-browser 量化当前间距

AI 没有凭感觉改，而是先用 `agent-browser eval` 跑了一段 JS 拿到真实计算样式：

```javascript
agent-browser eval 'JSON.stringify({
    h2Margin: getComputedStyle(document.querySelector(".prose h2")).margin,
    pMarginBottom: getComputedStyle(document.querySelector(".prose p")).marginBottom,
    blockquoteMargin: getComputedStyle(document.querySelector(".prose blockquote")).margin,
    hrMargin: getComputedStyle(document.querySelector(".prose hr")).margin,
    preMargin: getComputedStyle(document.querySelector(".prose pre")).margin,
    titleMargin: getComputedStyle(document.querySelector(".title")).margin
})'
```

返回结果暴露了节奏不一致的问题：

| 元素 | 原值 | 问题 |
|------|------|------|
| `h2` margin | `0 0 8px` | 标题下方几乎贴着内容，无呼吸感 |
| `blockquote` margin | `0` | 引用块上下完全无间距 |
| `hr` margin | `10px 0` | 分隔线太挤 |
| `.prose p` margin-bottom | `2em`(40px) | 段落间距过大 |
| `pre` margin | `20px 0` | 代码块上下间距偏紧 |
| `ul/ol` | 无显式 margin | 列表贴边 |

核心问题：**段落间距大、标题间距小**，垂直节奏反差强烈。

#### 重新设计垂直节奏

基于 frontend-design Skill 的"intentionality, not intensity"原则，AI 重新对齐了所有元素的间距到统一的 1.2em / 1.5em / 2.5em 三档节奏：

```css
/* 标题：上方留呼吸空间，下方紧凑 */
h1, h2, h3, h4, h5, h6 {
    margin: 1.5em 0 0.5em 0;
    line-height: 1.25;
}
h1:first-child, h2:first-child, h3:first-child, h4:first-child {
    margin-top: 0;     /* 首个标题不需要顶部间距 */
}

/* 段落：统一 1.2em，最后一个段落不留底部间距 */
p { margin-bottom: 1.2em; }
.prose p { margin-bottom: 1.2em; }
.prose p:last-child { margin-bottom: 0; }

/* 列表：补齐默认间距 */
.prose ul, .prose ol {
    margin: 1.2em 0;
    padding-left: 1.5em;
}
.prose li { margin: 0.4em 0; }

/* 代码块、引用块、表格、图片：统一 1.5em 上下间距 */
pre {
    padding: 1.2em 1.5em;
    margin: 1.5em 0;
    overflow-x: auto;
}
blockquote {
    padding: 0.2em 0 0.2em 1.2em;
    margin: 1.5em 0;
    font-size: 1.05em;
    color: rgb(var(--gray));
}
.prose table, .prose img { margin: 1.5em 0; }

/* 分隔线：最宽松，作为章节分隔 */
hr {
    border-top: 1px solid rgb(var(--gray-light));
    margin: 2.5em 0;
}
```

#### 同步精简标题块

原文章标题区有 `<hr />` 分隔线 + `padding: 1em 0`，在新节奏下显得冗余，AI 删掉了多余的分隔线并调整了标题区的 margin：

```astro
/* 删除了 <hr /> */
.title {
    margin-bottom: 2em;
    padding: 0;
    line-height: 1.2;
}
.title h1 { margin: 0.3em 0 0 0; }
.date {
    margin-bottom: 0;
    font-size: 0.9em;
    color: rgb(var(--gray));
}
```

### 这一轮的 AI 行为特点

- **不凭感觉，先量化**：用 agent-browser 拿到真实的 `getComputedStyle` 数值，再决定改什么
- **统一节奏而非逐个修补**：把所有元素的 margin 对齐到 1.2 / 1.5 / 2.5 三档，而不是各自调一个值
- **首元素特例处理**：用 `:first-child` 伪类避免首个标题多出顶部间距
- **删除冗余**：发现标题区的 `<hr />` 在新节奏下多余，直接删除而非保留
- **Skill 协作**：agent-browser 负责"看"，frontend-design 负责"审美判断"，两者协同

### 工具调用结构

```
Read global.css / BlogPost.astro    ← 定位宽度来源
Edit global.css                     ← 第一轮：加宽 + overflow-x
Edit BlogPost.astro                 ← 第一轮：加宽 .prose
git commit + push                   ← 第一轮提交

Skill: agent-browser                ← 第二轮：打开页面 + 截图 + eval
  └─ agent-browser eval             ← 提取计算样式
Skill: frontend-design              ← 第二轮：审美指引
Edit global.css                     ← 重新设计垂直节奏
Edit BlogPost.astro                 ← 精简标题块
```

### 教训

- **720px 是阅读舒适宽度，但不是技术文章舒适宽度**——技术文章含图表、流程图、代码块，需要更宽的容器
- **垂直节奏要统一**——段落 2em、标题 0.5rem 这种反差会让页面看起来"段落松散、标题拥挤"
- **`overflow-x: auto` 比 `white-space: pre-wrap` 更适合代码块**——保留代码原始格式，让用户横向滚动查看
