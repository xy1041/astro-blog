---
title: '使用gulp和webpack开发微信小程序'
description: '通过 VSCode 等通用 IDE 开发微信小程序，使用 Gulp 处理代码流程、Webpack 处理第三方依赖的实践'
pubDate: '2022-03-23'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['Typescript', 'React', '微信小程序', 'Gulp', 'Webpack']
---

微信小程序的IDE开发、打包📦 流程设计 和 typescript 应用方式

## 背景

要为直播sdk开发微信小程序版，希望通过通用IDE（VSCode、WebStorm）开发，微信小程序开发工具仅作为快速预览工具使用

希望使用Typescript，并且使用Gulp进行代码的处理和移动，在后续过程中发现处理打包关系上的诸多问题，因此在js处理流程中添加Webpack用来处理第三方依赖。

## 项目结构

```
.
├── README.md
├── config // gulp用到的配置文件
│   ├── path.js // 处理路径的方法
│   ├── tsimport.js // 将tsconfig中的paths定义的路径别名替换为相对路径的方法
│   ├── webpack.config.js // gulp的js处理流程中用到的webpack处理的配置文件
│   └── zip.js
├── dist // 打包之后生成的文件夹，微信小程序开发工具打开该文件夹
│   ├── SDK // 生成的SDK文件夹
│   ├── app.js // 小程序主文件
│   ├── app.json // 小程序主文件json
│   ├── app.wxss
│   ├── demo // 小程序业务文件夹
│   └── project.config.json // 小程序配置文件
├── doc // 生成的doc文件夹
├── gulpfile.js // gulp配置文件
├── package.json // 依赖
├── src
│   ├── SDK // sdk文件夹，主要是ts文件
│   ├── app.js // 小程序主文件，直接复制到dist中
│   ├── app.json // 小程序主文件json，直接复制到dist中
│   ├── app.wxss 
│   ├── demo // 小程序业务文件夹，直接复制到dist中
│   └── project.config.json // 小程序配置文件，直接复制到dist中
├── tsBuildDir // ts处理中间产物文件夹，从ts翻译成的js文件
├── tsconfig.json // ts配置文件，gulpfile中会用作解析规则
└── typedoc.json // 生成ts的doc文件的配置文件


```

## 开发过程中的问题

### typescript文件不受eslint约束


#### 解决方案

 <span style="color: orange"> 添加typescript-eslint的import支持 </span>

```javascript

// @file eslintrc.js

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  /** 添加Plugin配置 **/
  plugins: [
    'import',
    '@typescript-eslint'
  ],
  ecmaFeatures: {
    modules: true,
  },
  globals: {
    wx: true,
    App: true,
    Page: true,
    getCurrentPages: true,
    getApp: true,
    Component: true,
    requirePlugin: true,
    requireMiniProgram: true,
  },
  // 在import/resolver中添加typescript配置项，使它对typescript文件起效
  settings: {
    'import/resolver': {
      typescript: {}
    }
  },
  // 针对ts文件使用parser，并且将tsconfig引入作为project
  overrides: [ 
    {
      files: '**/*.ts',
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json'
      }
    }
  ],
  rules: {
    'quotes': ['error', 'single'],
    'semi': [2, 'never'],
    'max-len': [2, 250],
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'import/extensions': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/triple-slash-reference': 2, // @typescript-eslint/triple-slash-reference使用0、1、2作为可选值
    '@typescript-eslint/no-empty-function': 0, // 允许空函数存在
    '@typescript-eslint/naming-convention': [ // 命名的规则限制
      2,
      {
        selector: 'typeLike', // 类型类的定义 interface、type等
        format: ['PascalCase'], // 只允许首字母大写的Pascal方式命名
      }
    ]
  }
}

```

**使用overrides的原因**

如果不限定files，tsconfig.js中将js排除的配置会导致如下错误

<span style="color: red">Parsing error: "parserOptions.project" has been set for @typescript-eslint/parser. </span> 


### 小程序不认typescript中的paths

样例：

tsconfig文件(隐藏其他配置)

```json
{
  "compilerOptions": {
    "paths": {
      "utils/*": ["src/SDK/utils/*"],
      "consts/*": ["src/SDK/consts/*"],
      "components/*": ["src/SDK/components/*"],
      "api/*": ["src/SDK/apis/*"],
      "types/*": ["src/SDK/types/*"]
    }
  }
}
```

ts文件的imports

```typescript
//@file src/SDK/utils/im/IMEvent.ts

import {EVENTS, IM_ASK_THEME, LIVE_DELAY_HLS, STORE_KEYS} from 'consts/index'
import {get} from 'utils/store'
import {getUrlToken} from 'api/im/user'
import {IM_PROTO_NAMES} from 'consts/IMEvents'

```

#### 解决方案

<span style="color: orange">自己写一个将ts中的paths路径引用转化为相对路径的node脚本 </span>
脚本文件

```javascript
//@file config/tsimport.js

const fs = require('fs')
const path = require('path')

const through = require('through2')

const replacePath = (code, filePath, importOptions) => {
  const tscpaths = Object.keys(importOptions.paths) // 获取tsconfig中的paths配置
  const lines = code.split('\n') // 将文件按行分割为数组

  return lines.map((line) => {
    let matches = []
    const requireMatches = line.match(/require\(('|")(.*)('|")\)/g) // 判断是否是require代码
    const importMatches = line.match(/import (.*)('|")(.*)('|")/g) // 判断是否是import代码

    Array.prototype.push.apply(matches, requireMatches)
    Array.prototype.push.apply(matches, importMatches)

    matches = matches.filter(importLine => !importLine.match(/[.+]/g)) // 过滤出不包含相对路径的代码


    if (!matches || matches.length === 0) {
      return line
    }
    // 遍历
    for (const match of matches) {
      // 找到每一个path
      let matchAlias = false

      const sourcePath = path.dirname(filePath) // 获得文件的机器路径

      for (const tscpath of tscpaths) {
        // 寻找导入的模块 & 检查是否在tsconfig的paths配置中
        const requiredModules = match.match(new RegExp(tscpath, 'g'))


        if (requiredModules && requiredModules.length > 0) {
          for (const requiredModule of requiredModules) {
            // 如果在node_modules里的话就跳过
            const modulePath = path.resolve('./node_modules/' + tscpath)
            if (fs.existsSync(modulePath)) {
              continue
            }

            // 获得相对路径并替换
            const targetPath = path.dirname(path.resolve(importOptions.baseUrl + '/' + importOptions.paths[tscpath]))
            const relativePath = path.relative(sourcePath, targetPath)
            line = line.replace(new RegExp(tscpath, 'g'), './' + relativePath + '/')
            matchAlias = true
            return line
          }
        }
      }
    }
    return line
  }).join('\n') // 重新合并文件
}

module.exports = function (importOptions) {
  // 使用through.obj处理文件流，并且返回文件流
  return through.obj(function (file, enc, cb) {
    if (!file.contents) {
      return
    }
    let code = file.contents.toString('utf8')
    code = replacePath(code, file.history.toString(), importOptions)
    file.contents = Buffer.from(code)
    this.push(file)
    cb()
  })
}

```

使用脚本

```javascript
 //@file gulpfile.js


const tsProject = ts.createProject('tsconfig.json')
const TS_BUILD_DIR = 'tsBuildDir'

// 处理ts文件的流程
gulp.task('ts', () =>
  tsProject
    .src()
    .pipe(
      tsimport({ ...tsProject.config.compilerOptions, outDir: TS_BUILD_DIR }) // 使用tsimport, 并且将导出的文件路径定义为指定目录，不定义会报错
    )
    .pipe(tsProject())
    .js.pipe(preprocess({ context: envParsed.parsed }))
    .pipe(gulp.dest(TS_BUILD_DIR))
)

```

### 纯gulp+babel无法识别并提取node_modules中的第三方依赖

#### 引申问题：gulp+babel也无法将业务代码中没有引用的部分进行树摇优化（Tree Shaking）


```typescript

// @file src/SDK/utils/im/IMEventBus.ts

// 以下代码在gulp+babel打包下移动到dist中会保持原样，但因为微信开发者工具无法根据这个路径获取rxjs包，所以会报错
import {Subject, Subscription, filter, Observable} from 'rxjs'

```

#### 引申问题2：我们需要在微信小程序开发者工具中保持每个文件的位置以方便排查和打包

#### 解决方案
<span style="color: orange"> 引入webpack-stream </span>

关于webpack和gulp的关系，webpack的官方文档说明是这样的：
```
首先，我们要消除一个常见的误解。webpack是一个模块打包工具(modulebundler)（例如，Browserify或Brunch）。
而不是一个任务执行工具(taskrunner)（例如，Make,Grunt或者Gulp）。
任务执行工具用来自动化处理常见的开发任务，例如，lint(代码检测)、build(构建)、test(测试)。
相比模块打包工具，任务执行工具则聚焦在偏重上层的问题上面。
你仍然可以得益于这种用法：使用上层的工具，而将打包部分的问题留给webpack。
```

而gulp刚好就是一个任务执行工具

在gulp中使用的webpack插件就是[webpack-stream](https://github.com/shama/webpack-stream) （ [npm地址](https://www.npmjs.com/package/webpack-stream) ）

使用webpack-stream不需要单独安装webpack，webpack是该工具的直接依赖，安装webpack-stream之后需要在调用的时候提供一个配置对象，或者以我们熟悉的方式写一个webpack.config.js并以此作为调用时的配置项

webpack配置文件：
```javascript

// @file webpack.config.js

const path = require('path')
const { glob } = require('glob')
const TerserPlugin = require('terser-webpack-plugin')

const isPrd = process.env.NODE_ENV === 'production'

// 获取一个所有ts生成的js的chunk配置数组
function getEntries() {
  let map = {}
  const entryFiles = glob.sync('./tsBuildDir/**/*.js') // 遍历出tsBuildDir下的所有js文件地址

  entryFiles.forEach(filepath => {
    let fileDir = /.\/tsBuildDir\/(.*?)\.js/.exec(filepath) // 获取tsBuildDir往下的相对路径

    // 用该相对路径作为key，生成对应的chunk的配置作为value
    map[fileDir[1]] = {
      test: new RegExp(filepath),
      name: fileDir[1],
      enforce: true,
      priority: 90
    }
  })
  
  return map
}

module.exports = {
  mode: 'production',
  target: 'node',
  entry: { // 因为业务要求，我们要打包出来的js有两个入口调用，所以要用两个entry进行
    'Player/index': './tsBuildDir/Player/index.js',
    index: {
      import: './tsBuildDir/index.js',
      library: {
        type: 'commonjs2' // 有点迷，其他type都用过了，只有这个才行，commonjs包括umd都会无法require其他的依赖包
      }
    }
  },
  output: {
    filename: '[name].js', // name可以是带有'/'的形式，这样的output会生成该文件夹下的文件
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    sideEffects: false,
    minimize: isPrd,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: isPrd
          }
        }
      })
    ],
    // 为了让两个entry的运行时（即生成的实例）在同一个空间内可以互通，需要设置runtimeChunk配置
    runtimeChunk: {
      name: 'runtime'
    },
    // 实现保持webpack处理之后的js和之前的js的文件结构保持一致的重要配置，用splitChunk将每个文件都作为单独的chunk处理
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      minSizeReduction: 0,
      cacheGroups: {
        // 第三方全部打到vendor里，这个过程中会自动树摇，将第三方依赖中没有用到的部分去除
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          enforce: true, // 强制打包，无视大小和共用要求
          priority: 90
        },
        ...getEntries()
      }
    }
  }
}

```

使用配置

```javascript

// @file gulpfile.js

// 处理js文件的流程
gulp.task('js', () =>
  gulp
    .src([`${TS_BUILD_DIR}/**/*.js`, `src/${SDK_DIR}/**/*.js`])
    .pipe(babel())
    .pipe(webpack(require('./config/webpack.config.js')))
    .pipe(gulp.dest(BUILD_SDK_DIR))
)

```



## gulpfile文件


### gulp文件
```javascript

// ... 依赖import等


const tsProject = ts.createProject('tsconfig.json')
const TS_BUILD_DIR = 'tsBuildDir'
const SDK_DIR = 'SDK'
const BUILD_SDK_DIR = `dist/${SDK_DIR}`

const envParsed = dotenv.config({
  path: resolvePath(`./.env.${process.env.NODE_ENV}`)
})

const isProd = process.env.NODE_ENV !== 'development'
// 版本号
const version = isProd
  ? shell.exec('git describe --abbrev=0').stdout.trim()
  : null

const extraArray = [
  'src/**/*.*',
  '!src/**/*.{wxml,xml,html,wxss,json,css,less,jpg,jpeg,png,gif,svg}',
  `!src/${SDK_DIR}/**/*.js`,
  `!src/${SDK_DIR}/**/*.ts`
]

// 处理ts文件的流程
gulp.task('ts', () =>
  tsProject
    .src()
    .pipe(
      tsimport({ ...tsProject.config.compilerOptions, outDir: TS_BUILD_DIR }) // 使用tsimport
    )
    .pipe(tsProject())
    .js.pipe(preprocess({ context: envParsed.parsed }))
    .pipe(gulp.dest(TS_BUILD_DIR))
)

// 处理js文件的流程
gulp.task('js', () =>
  gulp
    .src([`${TS_BUILD_DIR}/**/*.js`, `src/${SDK_DIR}/**/*.js`])
    .pipe(babel())
    .pipe(webpack(require('./config/webpack.config.js')))
    .pipe(gulp.dest(BUILD_SDK_DIR))
)

// 处理小程序用的类html文件的流程
gulp.task('wxml', () =>
  gulp
    .src(['src/**/*.{wxml,xml,html}'])
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        caseSensitive: true,
        includeAutoGeneratedTags: false,
        keepClosingSlash: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      })
    )
    .pipe(rename({ extname: '.wxml' }))
    .pipe(gulp.dest('dist'))
)

// 处理小程序用的类css文件的流程

gulp.task('wxss', () =>
  gulp
    .src(['src/**/*.{less,wxss,css}'])
    .pipe(less())
    .pipe(postcss([pxtorpx()]))
    .pipe(gulpif(isProd, postcss([cssnano()])))
    .pipe(rename({ extname: '.wxss' }))
    .pipe(gulp.dest('dist'))
)

// 处理json文件的流程
gulp.task('json', () =>
  gulp
    .src(['src/**/*.json'])
    .pipe(gulpif(isProd, jsonminify()))
    .pipe(gulp.dest('dist'))
)

// 处理静态图片文件的流程
gulp.task('image', () =>
  gulp
    .src(['src/**/*.{jpg,jpeg,png,gif,svg}'])
    // .pipe(gulpif(isProd, imagemin()))
    .pipe(gulp.dest('dist'))
)

// 处理额外的指定文件的流程
gulp.task(
  'extras',
  gulp.parallel(
    () => gulp.src(extraArray).pipe(gulp.dest('dist')),
    () =>
      gulp
        .src('src/SDK/assets/**/*.js') // 这里额外的js可能被前面的webpack的treeShaking给去掉，需要额外操作一步
        .pipe(gulpif(isProd, uglify()))
        .pipe(gulp.dest('dist/SDK/assets'))
  )
)

// 清理dist文件夹和tsbuilderDir文件夹的流程
gulp.task('clean', cb => {
  del(['dist/*', `${TS_BUILD_DIR}/*`])
  cb()
})

// 运行build时的运行流程
gulp.task(
  'build',
  gulp.series( // 按照顺序运行如下流程
    'clean',
    'ts',
    'js',
    'wxml',
    'wxss',
    'json',
    'image',
    'extras',
    done => {
      if (isProd) {
        // 如果是正式环境build的话就进行zip打包
        generateZip(version)
      }
      done()
    }
  )
)

// 本地运行时的流程
gulp.task(
  'watch',
  gulp.series('build', () => {
    gulp.watch(`src/${SDK_DIR}/**/*.ts`, gulp.series('ts'))
    gulp.watch(
      [`${TS_BUILD_DIR}/**/*.js`, `src/${SDK_DIR}/**/*.js`],
      gulp.series('js')
    )
    gulp.watch('src/**/*.{wxml,xml,html}', gulp.series('wxml'))
    gulp.watch('src/**/*.{less,wxss,css}', gulp.series('wxss'))
    gulp.watch('src/**/*.json', gulp.series('json'))
    gulp.watch('src/**/*.{jpg,jpeg,png,gif,svg}', gulp.series('image'))
    gulp.watch(extraArray, gulp.series('extras'))
  })
)

// 默认运行watch流程
gulp.task('default', gulp.series('watch'))
```

### 使用gulp脚本

```shell

// 本地运行
cross-env NODE_ENV=development gulp watch

// 打包
cross-env NODE_ENV=production gulp build
```


## 后续优化

- ts到js之后的中转文件夹tsBuildDir是否可以省去
- 智能生成文档（已经使用 [typedoc](https://www.npmjs.com/package/typedoc) 实现）
- 我们编写的js文件如果import某个文件夹的话会载入这个文件夹下的index.js作为默认行为，但是小程序开发者只会找'文件夹名称.js'，ts同理，如何编写的时候按照常见逻辑编写但是可以让小程序开发者工具识别
