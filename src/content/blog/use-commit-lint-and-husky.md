---
title: '使用commitlint和husky校验git提交信息'
description: '使用 husky 8.x 与 commitlint 配置 git commit-msg hook，统一团队提交信息格式并支持自定义校验'
pubDate: '2022-06-30'
heroImage: '../../assets/blog-placeholder-4.jpg'
tags: ['git', 'commitlint', 'husky']
---

## 背景
在为Webpack5的脚手架搭建过程中，发现最新的husky的配置方式和commit信息的校验方式无法满足要求，故自己重新配置了husky和commitlint，来实现提交代码过程中对提交信息的控制。

## 配置

### Husky

Husky是一个让用户通过配置文件控制git hooks的包

> 本文章发布时，husky的版本为 8.0.1，安装和配置方法以8.0.1的文档为准

#### 安装与配置

**我们这里使用yarn安装**

1. 添加包
```shell
    yarn add husky -D
```

2. 添加脚本

在package.json中添加：
```json

{
  "private": true, // ← package.json设置private为true时，只需要运行husky install
  "scripts": {
    //     ...其他脚本
    "postinstall": "husky install"
  }
}

```

3. 手动运行husky install

```shell
    husky install
```

这一步是为了启用git hooks
运行之后，你的项目文件夹中就会多出一个.husky文件夹

4. 添加hook

```
    husky add .husky/commit-msg "npm run commitmsg"
```

这一步会在.husky文件夹下创建一个commit-msg文件，该文件使得husky可以在本地进行git commit时在commit-msg的hook触发时运行npm run commitmsg

文件内容如下：
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run commitmsg
```
如果需要修改执行的内容，可以手动修改npm run commitmsg这部分


### commitlint

commitlint是一个可以按照配置检查你指定的提交信息的包，可以帮助团队统一提交信息格式，减少沟通成本和保持系统健壮

#### 安装

1. 全局安装cli

进行全局安装，方便其他项目也使用

```shell
  npm install -g @commitlint/cli @commitlint/config-conventional
```

2. （可选）安装commitlint/types

如果你和我此处一样使用ts来进行配置文件的书写，那么需要在项目中安装commitlint/types
```shell
 yarn add @commitlint/types -D
```

#### 使用

1. 在项目文件根目录里创建一个commitlint配置文件

```typescript
// commitlint.config.ts

import type {UserConfig} from '@commitlint/types'

const Configuration: UserConfig = {
    extends: [
        '@commitlint/config-conventional'
    ],
    rules: {
        'type-enum': [2, 'always', [
            'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'
        ]],
    },
}


module.exports = Configuration


```

该配置使得commit信息必须以feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert开头，写成xxx: xxxxx的格式

一般情况这种配置文件下已经足够使用，但是为了让提示能更容易被同事注意到，需要创建一个可以自定义错误信息的commitlint规则

2. 添加自定义规则

修改commitlint.config.ts
```typescript

import type {UserConfig} from '@commitlint/types'

// 添加一个自定义的message生成方法
const errMsg = (msg: string) => `ERROR commit message 提交信息：‘${msg}’不符合提交约束规范！！！\n 
    commit message 提交信息规范：请参考以下提示:\n
    feat: 类型为 feat 的提交表示在代码库中新增了一个功能。 git commit -am "feat: 增加了...功能"\n
    fix:  类型为 fix 的提交表示在代码库中修复了一个bug。 git commit -am "fix: 修复了...bug"\n`

const Configuration: UserConfig = {
    extends: [
        '@commitlint/config-conventional'
    ],
    rules: {
        // 将默认的type-enum规则禁用
        'type-enum': [0, 'always', [
            'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'
        ]],
        // 添加自定义规则并启用
        'msg-start': [2, 'always']
    },
    plugins: [
        {
            rules: {
                // 添加规则
                'msg-start': ({raw}) => {
                    const regExp = /^((v\d+\.\d+\.\d+(-(alpha|beta|rc.\d+))?)|((revert: )?(feat|fix|docs|style|refactor|perf|test|workflow|ci|chore|types|merge)(\(.+\))?!?: .{1,50}))|(.?Merge\sbranch)/
                    if (!regExp.test(raw)) {
                        return [false, errMsg(raw)]
                    }
                    return [true, '']
                }
            }
        }
    ]
}


module.exports = Configuration


```

这样一来，当commit信息不符合我们要求的正则时，控制台便会输出我们指定的中文错误信息，可读性更强

3. 添加npm script

我们先前添加了husky控制的git hooks，在commit-msg hook触发时要运行npm run commitmsg命令，但是当前package.json中并没有该npm script，我们需要手动添加

> 注意，运行npm run commitmsg而不是直接运行 commitlint -e $GIT_PARAMS 是因为husky的hooks执行的时候并不是项目文件夹内执行，所以需要用npm指定用项目文件夹来执行脚本

```json
{
  "scripts": {
    //     ...其他脚本
    "commitmsg": "commitlint -e $GIT_PARAMS"
  }
}

```



以上内容完成之后，在git commit的时候，就会对commit信息进行格式检查，并且在错误的时候输出信息了

## 总结

husky可以让用户控制非常多的git hooks，比如控制pre-commit之前进行eslint检查、prettier格式化等，可以进行进一步的功能挖掘
在我们之前的实践中，使用的husky是4.x版本，相比8.x有非常大的变化，包括自动安装git hooks和husky的脚本从package.json变为.husky文件夹等，需要格外注意

## 参考
- [husky文档](https://typicode.github.io/husky/)
- [commitlint文档](https://commitlint.js.org/)
- [commitlint从0到1](https://juejin.cn/post/6979054290526535717)
