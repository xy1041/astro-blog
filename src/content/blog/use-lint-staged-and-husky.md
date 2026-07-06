---
title: '使用lint-staged在git提交前校验并自动修复部分不符合eslint规则的代码'
description: '通过 husky 的 pre-commit hook 配合 lint-staged，在 git 提交前自动运行 eslint 校验与修复'
pubDate: '2022-07-11'
heroImage: '../../assets/blog-placeholder-5.jpg'
tags: ['git', 'lint-staged', 'husky']
---

## 背景 
一样是脚手架搭建过程中需要的功能，在提交代码前自动运行eslint检查代码规范，并自动修复一些错误

## 配置

### Husky

在之前的blog中已经提到，详情见（[使用commitlint和husky校验git提交信息](/blog/use-commit-lint-and-husky)）

### lint-staged

#### 配置完成eslint或其他代码检查工具


在使用lint-staged之前需要保证自己已经安装eslint并且可以正常利用eslint的命令行执行检查操作，如：
```shell
eslint ./src --fix
```

#### 安装lint-staged

确认eslint可用之后安装lint-staged

```
yarn add lint-staged -D
```

#### 添加lint-staged脚本和配置

然后在src/package.json文件的scripts中添加提交前执行的脚本和lint-staged配置

```json
// package.json

{
  "scripts": {
    // ...其他脚本
    "lint-staged": "lint-staged"
  },
  "lint-staged": {
    "./**/*.{ts, js}": [
      "eslint --fix" // 此处的命令可以是自己定义的其他eslint命令行指令，符合自己需求即可
    ]
  }
}
```

#### 添加husky的pre-commit hook文件

运行命令行
```shell
husky add .husky/pre-commit "npm run lint-staged"
```

这一步会给.husky文件夹添加pre-commit文件，它的内容如下：
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged
```

完成配置之后，在commit代码时，husky就会自动在提交前先验证代码规范和修复部分错误了。

## 总结

进行pre-commit hook的配置之后，在进行commit行为时，如果不符合eslint配置的话，代码将会在命令行报错并无法提交。

这可以有效解决在开发部门的人数较多，代码规范培训不到位，或有部分员工本地eslint无法正常起效果时将代码以不符合规范的形态提交的问题，进一步提升代码的可维护性和可读性。

## 参考
- [lint-staged文档](https://github.com/okonet/lint-staged#readme)
