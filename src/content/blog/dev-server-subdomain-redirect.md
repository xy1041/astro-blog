---
title: 'webpack dev-server 使用 nginx 子域名代理时刷新路由页面回到二级域名 index.html 的解决方法'
description: '在 qiankun 微前端本地开发中，使用 nginx 反代子域名时刷新页面跳回 index.html 的问题排查与解决'
pubDate: '2022-06-14'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['Webpack', 'WebpackDevServer', 'historyApiFallback']
---

## 背景

某后台管理项目 [乾坤](https://qiankun.umijs.org/zh/guide) 驱动，由一个主项目通过乾坤的微前端方式引入下属的多个微项目，每个微项目都占据该主项目下的一个二级域名，在本地对某个微项目进行开发时，为了能够模拟多个微项目之间跳转或者模拟微项目子域名的跳转功能，需要用nginx对该子域名进行代理，nginx配置如下：

```

    http {
    
      server {
            listen 80;
            server_name dev.xxx.com;
    
            location / {
              proxy_pass http://localhost:3001;
            }
            location /sub1 {
              proxy_pass http://localhost:3001;
            }
            location /sub2 {
              proxy_pass http://localhost:3000;
            }
            location /sub3 {
              proxy_pass http://localhost:8081;
            }
       }
    
    }


```

同时，通过webpackDevServer启动对应子项目的本地服务器，并将webpack和webpack-dev-server所用的PUBLIC_URL设定为nginx代理的二级域名，获得publicUrl的方式如下

```javascript

const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL
);

```

但实际使用时，发现当本地页面通过react的跳转等方式进入二级域名的更深层路由后，刷新页面的话，会跳转到对应二级域名的index.html，如：

地址：
> http://dev.xxx.com/sub1/somePath

如果此时在浏览器中刷新，浏览器地址会变为
> http://dev.xxx.com/sub1/index.html

为了在本地能够模拟测试和线上环境中的多子项目情况，需要解决该问题

## 过程

暂时省略，步骤较多

## 结论

通过排查发现，devServer的配置中，historyApiFallback配置项的值为true，该值在普通Webpack项目中可以正常使用，但在子项目中，会导致路由地址302之后自动跳转到该public_url下的index.html地址，需要将配置改为：
```javascript
// 子项目public_url,即nginx代理的二级域名
const publicUrl = '/sub1/' 

// 返回devServer配置项
return {
  ...,
  historyApiFallback: {
    index: publicUrl
  },
}

```

修改完成之后，直接刷新页面即可保留在当前页面，但是devServer实际返回给浏览器的是单页应用的index.html,此时单页应用的路由发挥功能，判断路由地址后载入对应页面的js并进行渲染，即可正常使用。


## 参考

- [1] [connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback)
- [2] [webpack-dev-server的historyApiFallback配置](https://webpack.js.org/configuration/dev-server/#devserverhistoryapifallback)
- [3] [stackOverFlow的相关提问](https://stackoverflow.com/questions/31945763/how-to-tell-webpack-dev-server-to-serve-index-html-for-any-route)
