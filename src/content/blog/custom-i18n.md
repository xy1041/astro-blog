---
title: '分析formatJS的自定义i18n涉及的文字提取方案'
description: '分析 formatJS 的 extract 方案的运行原理，为公司的跨框架国际化方案提供参考'
pubDate: '2025-11-28'
heroImage: '../../assets/blog-placeholder-5.jpg'
tags: ['i18n', 'formatJS', 'Typescript']
---

# 背景

公司的aPaaS系统分层多，时间跨度大，使用框架多，为了能够尽可能快速地实现大部分系统的国际化，需要开发一个能够跨框架、方便开发者使用、能够进行时间转换和数字格式转换等功能的国际化方案，其中需要尽可能对开发者友好，能够让开发者尽可能快地提取出现有的中文文案并生成文件，交由国际化团队进行翻译，并且翻译后的文本可以简单地应用于项目中，故对类似功能的包进行分析

类似的功能参考[formatJS](https://formatjs.github.io/), 它的extract方案如下：


# 运行方式
formatjs的extract方案，通过install后注册全局CLI的方式运行。

``` bash
formatjs extract -- 'src/**/*.ts*' --ignore='**/*.d.ts' --out-file lang/en.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'
```

# 运行原理

使用cli运行后，会执行formatjs的bin目录中的相关js脚本，除去大部分判断逻辑、I/O和与extract 函数调用无关的代码后，核心代码为

``` javascript

/**
 * Extract strings from source files
 * @param files list of files
 * @param extractOpts extract options
 * @returns messages serialized as JSON string since key order
 * matters for some `format`
 */
export async function extract(
  files: readonly string[],
  extractOpts: ExtractOpts
) {

    let rawResults: Array<ExtractionResult | undefined>
    
    rawResults = await Promise.all(
      files.map(async fn => {
        try {
          const source = await readFile(fn, 'utf8')
          return processFile(source, fn, opts)
        } catch (e) {
          if (throws) {
            throw e
          } else {
            warn(String(e))
          }
        }
      })
)
}

async function processFile(
  source: string,
  fn: string,
  {idInterpolationPattern, ...opts}: Opts & {idInterpolationPattern?: string}
){
    let messages: ExtractedMessageDescriptor[] = []


    opts = {
          ...opts,
          onMsgExtracted(_, msgs) {
              messages = messages.concat(msgs)
            },
          }
    
    const scriptParseFn = parseScript(opts, fn)
    
    scriptParseFn(source)
}


/**
 * Invoid TypeScript module transpilation with our TS transformer
 * @param opts Formatjs TS Transformer opt
 * @param fn filename
 */
export function parseScript(opts: Opts, fn?: string) {

    return (source: string) => {
      let output
      
      output = ts.transpileModule(source, {
          compilerOptions: {
            allowJs: true,
            target: ts.ScriptTarget.ESNext,
            noEmit: true,
            experimentalDecorators: true,
          },
          reportDiagnostics: true,
          fileName: fn,
          transformers: {
            before: [transformWithTs(ts, opts)],
          },
        })
    }
}

export function transformWithTs(ts: TypeScript, opts: Opts) {

    return ctx => {
      return (sf: typescript.SourceFile) => {
        return ts.visitNode(sf, getVisitor(ts, ctx, sf, opts))
      }
    }
}

function getVisitor(
  ts: TypeScript,
  ctx: typescript.TransformationContext,
  sf: typescript.SourceFile,
  opts: Opts
) {

    const visitor: typescript.Visitor = (
      node: typescript.Node
    ): typescript.Node => {
      const newNode = ts.isCallExpression(node)
        ? extractMessagesFromCallExpression(ts, ctx.factory, node, opts, sf)
        : ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)
        ? extractMessageFromJsxComponent(ts, ctx.factory, node, opts, sf)
        : node
      return ts.visitEachChild(newNode, visitor, ctx)
    }
    return visitor
}

function extractMessagesFromCallExpression(
  ts: TypeScript,
  factory: typescript.NodeFactory,
  node: typescript.CallExpression,
  opts: Opts,
  sf: typescript.SourceFile
): typeof node {
    const {onMsgExtracted, additionalFunctionNames} = opts
    
    
    if (
      isSingularMessageDecl(ts, node, opts.additionalComponentNames || []) ||
      isMemberMethodFormatMessageCall(ts, node, additionalFunctionNames || [])
    ) {
        const [descriptorsObj, ...restArgs] = node.arguments
        if (ts.isObjectLiteralExpression(descriptorsObj)) {
          const msg = extractMessageDescriptor(ts, descriptorsObj, opts, sf)
          if (!msg) {
            return node
          }
          debug('Message extracted from "%s": %s', sf.fileName, msg)
          if (typeof onMsgExtracted === 'function') {
            onMsgExtracted(sf.fileName, [msg])
          }
    }
}


function isSingularMessageDecl(
  ts: TypeScript,
  node:
    | typescript.CallExpression
    | typescript.JsxOpeningElement
    | typescript.JsxSelfClosingElement,
  additionalComponentNames: string[]
) {
  const compNames = new Set([
    'FormattedMessage',
    'defineMessage',
    'formatMessage',
    '$formatMessage',
    ...additionalComponentNames,
  ])
  let fnName = ''
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    fnName = node.expression.text
  } else if (ts.isJsxOpeningElement(node) && ts.isIdentifier(node.tagName)) {
    fnName = node.tagName.text
  } else if (
    ts.isJsxSelfClosingElement(node) &&
    ts.isIdentifier(node.tagName)
  ) {
    fnName = node.tagName.text
  }
  return compNames.has(fnName)
}

/**
 * Check if node is `foo.bar.formatMessage` node
 * @param node
 * @param sf
 */
function isMemberMethodFormatMessageCall(
  ts: TypeScript,
  node: typescript.CallExpression,
  additionalFunctionNames: string[]
) {
  const fnNames = new Set([
    'formatMessage',
    '$formatMessage',
    ...additionalFunctionNames,
  ])
  const method = node.expression

  // Handle foo.formatMessage()
  if (ts.isPropertyAccessExpression(method)) {
    return fnNames.has(method.name.text)
  }

  // Handle formatMessage()
  return ts.isIdentifier(method) && fnNames.has(method.text)
}



```

可以看到，在通过typescript的compiler，formatjs获得了代码的typescript node结构，通过ts判断node的类型，将callExpression的过滤出来，然后通过**node.expression下的name或text获得函数名**，判断是否是调用formatMessage和$formatMessage方法，以及其他自己传入的函数名的callExpression，来决定是否要将该node下的相关属性提取出来。

# 分析结果
后续按照formatJS的实现方案，将其修改为判断$hbt方法的调用，然后在开发过程中只需要用$hbt方法包裹需要翻译的文字，之后就可以由他人执行extract命令，并导出对应的字符串，再交由翻译人员进行翻译了

# 参考
- [formatJS cli-libs](https://github.com/formatjs/formatjs/tree/71c90e2ee5e57649a691168499534adce7b053a6/packages/cli-lib/src)
