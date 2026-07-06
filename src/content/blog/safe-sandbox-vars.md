---
title: '允许用户自定义的沙箱安全策略'
description: '在公司低代码自定义组件系统中，对用户编写的 React 组件执行环境进行沙箱隔离的安全配置方案'
pubDate: '2025-11-28'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['sandbox']
---

# 背景

公司的低代码自定义组件系统，允许用户自己编写React组件并执行，为了防止其对全局内容造成安全隐患，要对它执行的环境进行沙箱隔离，隔离时过滤掉其中危险的部分代码，并且对自定义组件可以使用的变量、方法等进行限制。

# 限制变量表

``` typescript

// 安全配置常量

export const SECURITY_CONFIG = {
  // 禁止访问的全局变量/方法 (通过window代理和直接拦截限制)
  FORBIDDEN_GLOBALS: [
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'Worker',
    'SharedWorker',
    'ServiceWorker',
    'EventSource',
    'Request',
    'Headers',
    'RTCPeerConnection',
    'RTCDataChannel',
    'BroadcastChannel',
    'MessageChannel',
    'MediaSource',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'eval',
    'Function',
    'globalThis',
    'parent',
    'top',
    'open',
    'postMessage',
  ],

  // 完全禁止访问的特殊敏感属性 (通过AST分析限制)
  FORBIDDEN_SENSITIVE_PROPERTIES: [
    'ownerDocument',
    'defaultView',
    'contentWindow',
    'contentDocument',
    'cookie',
    'getRootNode',
    'sendBeacon',
    'registerProtocolHandler',
    'registerContentHandler',
    'credentials',
    'serviceWorker',
  ],

  // 禁止创建的HTML元素
  FORBIDDEN_ELEMENTS: ['script', 'iframe', 'object', 'embed', 'applet'],

  // 敏感属性
  SENSITIVE_ATTRIBUTES: ['src', 'srcdoc', 'code', 'data'],

  // 使用正则表达式检查危险代码模式
  DANGEROUS_PATTERNS: [
    // Script标签插入
    /<script/i,
    /document\.createElement\(['"`]script['"`]\)/i,

    // iframe相关
    /<iframe/i,
    /document\.createElement\(['"`]iframe['"`]\)/i,

    // 请求相关
    /new XMLHttpRequest/i,

    // 其他危险API
    /eval\s*\(/i,
    /new Function/i,

    // React危险属性
    /dangerouslySetInnerHTML/i,

    // localStorage访问模式
    /localStorage\./i,
    /\.localStorage/i,
    /\['localStorage'\]/i,
    /\["localStorage"\]/i,
    /\[`localStorage`\]/i,
    /window\.localStorage/i,
    /globalThis\.localStorage/i,

    // sessionStorage同样拦截
    /sessionStorage\./i,
    /\.sessionStorage/i,
    /\['sessionStorage'\]/i,
    /\["sessionStorage"\]/i,
    /\[`sessionStorage`\]/i,
    /window\.sessionStorage/i,
    /globalThis\.sessionStorage/i,

    // cookie访问
    /\.cookie/i,
    /\[['"]cookie['"]]/i,
    /\['cookie']/i,
    /\["cookie"]/i,

    // ownerDocument相关
    /\.ownerDocument/i,
    /\['ownerDocument'\]/i,
    /\["ownerDocument"\]/i,
    /\[`ownerDocument`\]/i,

    // defaultView相关
    /\.defaultView/i,
    /\['defaultView'\]/i,
    /\["defaultView"\]/i,
    /\[`defaultView`\]/i,

    // contentWindow相关
    /\.contentWindow/i,
    /\['contentWindow'\]/i,
    /\["contentWindow"\]/i,
    /\[`contentWindow`\]/i,

    // 字符串拼接相关方法
    /String\.fromCharCode/i,
    /String\.fromCodePoint/i,
    /\.concat\(/i,
  ],

  // 计时器方法 - 需要特殊处理
  TIMER_FUNCTIONS: ['setTimeout', 'setInterval'],
};


```

在创造沙箱window和React等全局对象时，通过以上的规则来识别并清除、限制可能有隐患的代码调用、定义，即可实现一个较为安全的沙箱运行环境
