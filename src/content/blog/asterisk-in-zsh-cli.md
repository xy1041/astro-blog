---
title: '星号符号（*）在CLI开发中造成的困难'
description: '在为 CLI 工具传入带星号的参数时遇到 zsh: no matches found 问题的分析与解决过程'
pubDate: '2022-11-15'
heroImage: '../../assets/blog-placeholder-2.jpg'
tags: ['Javascript', 'CLI', 'Node']
---

## 背景

在为公司的翻译工具创建CLI时，传入的参数中有星号符号（*）时遇到了无法识别，打印`zsh: no matches found`的问题

## 名词解释

`*` ：星号符号，英文为asterisk，以下简称星号

## 问题描述

在开发CLI时，将带有星号的字符串作为option的参数传入，发现报错`zsh: no matches found`，如果没有星号即不会报错


```bash
// 此时会报错
$ my-namespace my-command my-file-path -e src/**/*.ts src/**/*.tsx src/**/*.js src/**/*.jsx   

$ zsh: no matches found: src/**/*.tsx

// 此时不会报错
$ my-namespace my-command my-file-path -e src/.ts src/.tsx src/.js src/.jsx   

// commander打印的参数
$ {
  oldFile: 'my-file-path',
  cmdObj: {
    extract: [ 'src/.ts', 'src/.tsx', 'src/.js', 'src/.jsx' ]
  }
}


```

经过查阅资料：

[stackOverflow](https://unix.stackexchange.com/questions/140997/how-to-filteri-by-asterisk-or-similar-expression-by-rsync-in-zsh)

[Github Issues](https://github.com/tj/commander.js/issues/1576)

[CSDN](https://blog.csdn.net/qq_36148847/article/details/79260745)
