---
title: '更新react-router和react-router-dom到v6'
description: '将项目中的 react-router 与 react-router-dom 升级到 v6 的过程与踩坑记录'
pubDate: '2022-04-18'
heroImage: '../../assets/blog-placeholder-3.jpg'
tags: ['Javascript', 'React', 'react-router', 'react-router-dom', 'Hooks']
---

## 背景

开发新项目的时候想找一个自己写的getQueryString的替代品，发现react-router-dom在6.0版本更新了useSearchParams的hooks，可以方便的获得浏览器地址里的query参数，故顺便将项目里的react-router-dom更新到了6.0

## 过程

1. 更新package
    
    将package.json中的react-router和react-router-dom更新到v6.0以上（当前是v6.3.0）
        
    删除package中的history包，当前react-router直接引用该包，不需要单独引入

2. 替换路由组件
   1. Redirect
    
       首先，将所有的Switch中直接包裹的Redirect都替换为Route包裹的Redirect
      ```javascript
       // 修改前：
      
        <Switch>
          <Redirect from="about" to="about-us" />
        </Switch>
      
       // 修改后：
      
        <Switch>
           <Route path="about" render={() => <Redirect to="about-us" />} />
        </Switch>
    
      ```
      然后将所有的被Route包裹的Redirect修改为Navigate
      ```javascript
        // 修改前
         <Switch>
           <Route path="about" render={() => <Redirect to="about-us" />} />
        </Switch>
      
        // 修改后
        <Switch>
           <Route path="about" element={<Navigate replace to="about-us" />} />
        </Switch>
      ```
      
   2. Switch
      
      将所有Switch改为Routes
      ```javascript
        // 修改前
         <Switch>
          {
           // ...Route
          }
         </Switch>
      
        // 修改后
         <Routes>
          {
           // ...Route
          }
         </Routes>
      ```

3. 替换自定义hooks
   1. 将所有 useHistory 替换为 useNavigate
      
      ```javascript
      //修改前
      const history = useHistory()
      history.push('/')
      
      //修改后
      const navigate = useNavigate()
      navigate('/')
      ```
      
      注意⚠️：原来的useHistory中可以获得location（history.location），升级v6之后通过useLocation获得
   2. useSearchParams
      
      新增useSearchParams hook，可以直接获取query的内容
      ```javascript
      //修改前
      const queryA = getQueryString('queryA') // 自己实现的方法
      
      //修改后
      const [query] = useSearchParams()
      const queryA = query.get('queryA')
      ```
      优势：这样可以用useEffect监听query变化，query里也有getAll方法可以获得一个query的key有多个的情况下的全部值

## 问题

1. 截止现在（2022-4-18），@types/react-router-dom仍未更新到v6，在ts项目里使用的时候会比较不舒服
2. Redirect其实官方推荐的方法是[服务端进行处理](https://gist.github.com/mjackson/b5748add2795ce7448a366ae8f8ae3bb) ，如果有服务端项目的话可以优先进行服务端处理

-----

参考：
- [React-Router Documentation - Upgrading from V5](https://reactrouter.com/docs/en/v6/upgrading/v5)
- [Redirects in React Router v6](https://gist.github.com/mjackson/b5748add2795ce7448a366ae8f8ae3bb)
