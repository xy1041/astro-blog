---
title: 'Markdown 样式指南'
description: '这里展示了一些在 Astro 中编写 Markdown 内容时可以使用的基础 Markdown 语法示例。'
pubDate: 'Jun 19 2024'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['Markdown', '教程']
---

这里展示了一些在 Astro 中编写 Markdown 内容时可以使用的基础 Markdown 语法示例。

## 标题

以下 HTML `<h1>`—`<h6>` 元素代表了六个层级的章节标题。`<h1>` 是最高层级，而 `<h6>` 是最低层级。

# H1

## H2

### H3

#### H4

##### H5

###### H6

## 段落

无奋乎积学以储宝，酌理以富才。研阅以穷照，驯致以绎辞。揽群书而采其华，抚万殊而一其趣。缀文者情动而辞发，观文者披文以入情。夫神思之运，远想长存。寂然凝虑，思接千载；悄焉动容，视通万里。吟咏之间，吐纳珠玉之声；眉睫之前，卷舒风云之色。其思理之致乎。

故思理为妙，神与物游。神居胸臆，而志气统其关键；物沿耳目，而辞令管其枢机。枢机方通，则物无隐貌；关键将塞，则神有遁心。是以陶钧文思，贵在虚静，疏瀹五藏，澡雪精神。学以聚之，问以辨之，宽以居之，仁以行之。

## 图片

### 语法

```markdown
![替代文本](./图片的/完整/或/相对/路径)
```

### 效果

![博客占位图](../../assets/blog-placeholder-about.jpg)

## 引用

引用元素表示来自其他来源的内容，可选择性地附带出处（需置于 `footer` 或 `cite` 元素中），并可选择性地添加行内修改（如注释和缩写）。

### 无出处的引用

#### 语法

```markdown
> 学习之，笃行之，明辨之，审问之。  
> **注意**：在引用中可以使用 _Markdown 语法_。
```

#### 效果

> 学习之，笃行之，明辨之，审问之。  
> **注意**：在引用中可以使用 _Markdown 语法_。

### 带出处的引用

#### 语法

```markdown
> 不要通过共享内存来通信，而应通过通信来共享内存。<br>
> — <cite>Rob Pike[^1]</cite>
```

#### 效果

> 不要通过共享内存来通信，而应通过通信来共享内存。<br>
> — <cite>Rob Pike[^1]</cite>

[^1]: 上面的引用摘自 Rob Pike 在 2015 年 11 月 18 日 Gopherfest 上的[演讲](https://www.youtube.com/watch?v=PAAkCSZUG1c)。

## 表格

### 语法

```markdown
| 斜体   | 粗体   | 代码   |
| ------ | ------ | ------ |
| _斜体_ | **粗体** | `代码` |
```

### 效果

| 斜体   | 粗体   | 代码   |
| ------ | ------ | ------ |
| _斜体_ | **粗体** | `代码` |

## 代码块

### 语法

可以在新行中使用 3 个反引号 ``` 来编写代码片段，并在新行用 3 个反引号结束。若要高亮显示特定语言的语法，在前 3 个反引号后写明语言名称，例如：html、javascript、css、markdown、typescript、txt、bash。

````markdown
```html
<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <title>HTML5 文档示例</title>
  </head>
  <body>
    <p>测试</p>
  </body>
</html>
```
````

### 效果

```html
<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <title>HTML5 文档示例</title>
  </head>
  <body>
    <p>测试</p>
  </body>
</html>
```

## 列表类型

### 有序列表

#### 语法

```markdown
1. 第一项
2. 第二项
3. 第三项
```

#### 效果

1. 第一项
2. 第二项
3. 第三项

### 无序列表

#### 语法

```markdown
- 列表项
- 另一个列表项
- 再一个列表项
```

#### 效果

- 列表项
- 另一个列表项
- 再一个列表项

### 嵌套列表

#### 语法

```markdown
- 水果
  - 苹果
  - 橙子
  - 香蕉
- 乳制品
  - 牛奶
  - 奶酪
```

#### 效果

- 水果
  - 苹果
  - 橙子
  - 香蕉
- 乳制品
  - 牛奶
  - 奶酪

## 其他元素 — abbr、sub、sup、kbd、mark

### 语法

```markdown
<abbr title="图形交换格式">GIF</abbr> 是一种位图图像格式。

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

按 <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> 结束会话。

大多数 <mark>蝾螈</mark> 是夜行动物，以昆虫、蠕虫和其他小生物为食。
```

### 效果

<abbr title="图形交换格式">GIF</abbr> 是一种位图图像格式。

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

按 <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> 结束会话。

大多数 <mark>蝾螈</mark> 是夜行动物，以昆虫、蠕虫和其他小生物为食。
