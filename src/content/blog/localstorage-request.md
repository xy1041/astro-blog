---
title: '通过 LocalStorage 实现的跨浏览器页签通信机制'
description: '基于浏览器 Storage 事件与 rxjs 实现的跨页签通信工具类'
pubDate: '2021-12-15'
heroImage: '../../assets/blog-placeholder-4.jpg'
tags: ['Javascript', 'React', 'LocalStorage', 'Storage', 'Storage-API']
---

## 背景

为了给公司的某桌面原生app提供可以在一个应用中的多个页签之间互相通信的功能，完成了一个通过可以跨页签的localStorage进行通信的工具类

## 思路

为了实现该功能，需要用到浏览器的 [Storage事件](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/storage_event)

该事件要求触发和监听的localStorage处于同一个域名下，**http协议也必须保持一致，这一点在上线前测试的过程中出现过问题**

最终我们需要实现一个事件监听器、一个事件触发器，和一个获取触发事件的回调的一次性回调监听器

## 代码


### 实现功能代码

最终实现时，为了简单和明了的监听localStorage中特定的key，使用了[rxjs](https://www.npmjs.com/package/rxjs) 进行window的storage事件监听和过滤，以及对外的事件监听和停止监听

```javascript

import { v4 as uuidv4 } from 'uuid'
import {filter, firstValueFrom, fromEvent, interval, map, mergeMap, take} from 'rxjs'

 // 用作localStorage的前缀，和其他进行区分
const API_NAME_SPACE = 'STORAGE_REQUEST'

const STORAGE_API_ERR_CODE = -99999

// 对当前的页签创建uuid
const windowId = uuidv4()

// 统一处理监听某api的名称的方法
const linkAPI = (apiName) => {
  return `${API_NAME_SPACE}_${apiName}`
}


// 创建一个只监听一次Storage特定名称的事件，主要用于监听发送的跨页面LocalStorage通信的返回值
const addStorageListenerForOnce = async (storageName, element = window) => {

  if (!storageName) {
    console.error('监听的storageName不能为空')
    return false
  }

  // 使用rxjs的firstValueFrom方法，该方法用以替换toPromise方法，可以方便地用在async函数中
  const changeEvent = await firstValueFrom(fromEvent(element, 'storage')
    .pipe(filter(e => e.storageArea[storageName]), map(e => e.storageArea[storageName])))

  console.log(`监听storage中的${storageName}变化触发了：`, changeEvent)

  // 这种只监听一次的事件，触发之后即可在localStorage中删除对应的key的内容
  localStorage.removeItem(storageName)

  // 返回Promise，方便处理
  return changeEvent
}

// 通过localStorage向其他页签进行请求的方法
export const storageRequest = async (apiName, apiParams) => {

  const newReq = {
    name: apiName, // 请求的api名称，与另一个页签监听的api一致
    params: apiParams, // 请求参数，应当是一个数组，格式和函数的arguments相同
    uid: `BSY_API_RES_${uuidv4()}`, //给该次请求创建一个请求uid，发送之后会监听localStorage中该uid作为key的内容的变化，另一个页签获得请求结果之后将结果存入localStorage的该key下
    windowId // 该页签的id
  }

  // 获取当前的localStorage中的该api名称的请求排队列表
  const currentQueueStr = localStorage.getItem(linkAPI(apiName))

  let newQueueArr = []

  try {
    newQueueArr = JSON.parse(currentQueueStr || '[]')
  } catch (e) {
    console.error('获取requestQueue时失败，', e)
  }

  // 将该请求置于队列最后
  newQueueArr.push(newReq)

  /// 将更新过的队列存入localStorage
  localStorage.setItem(linkAPI(apiName), JSON.stringify(newQueueArr))

  // 开始监听请求uid，尝试获得请求结果
  const res = await addStorageListenerForOnce(newReq.uid)

  // 返回获得的请求结果
  return JSON.parse(res)
}

// 从localStorage中特定的api名称对应的请求排队列表里删除特定的uid代表的请求
const clearRequestQueue = (uid, storageName) => {
  
  let newCurrentStorage = localStorage.getItem(storageName)

  if (newCurrentStorage) {
    const storageObj = JSON.parse(newCurrentStorage)
    const indexToClear = storageObj.findIndex(item => item.uid === uid)

    if (indexToClear > -1) {
      storageObj.splice(indexToClear, 1)

      newCurrentStorage = JSON.stringify(storageObj)

      localStorage.setItem(storageName, newCurrentStorage)
    }
  }

  return newCurrentStorage

}


/**
 * 监听某个特定的api对应的localStorage请求队列的变化，处理之后将返回值按照请求的uid存入localStorage的方法
 * 返回一个Observable的Subscription，可以进行取消订阅操作
 */

export const addApiListener = (apiName, callback, element = window) => {


  const storageName = linkAPI(apiName)

  // 在监听之前先获取目前localStorage中已经有的请求列表
  let currentStorage = localStorage.getItem(storageName) || '[]'



  // 处理请求的方法
  const resolveRequest = res => {
    const {name, uid, params} = res

    let paramsArr = []

    if (Array.isArray(params)) {
      paramsArr = params
    } else {
      paramsArr = params ? [params] : []
    }

    if (callback && uid) {
      const ret = callback(...paramsArr)
      if (ret instanceof Promise) {
        ret.then(pres => {
          if (pres) {
            localStorage.setItem(uid, JSON.stringify(pres))
          } else {
            localStorage.setItem(uid, JSON.stringify({code: STORAGE_API_ERR_CODE}))
          }
        }).catch(e => {
          console.error('请求错误：', e)
          localStorage.setItem(uid, JSON.stringify({code: STORAGE_API_ERR_CODE, msg: e.msg || '未知错误'}))
        })
      } else {
        localStorage.setItem(uid, JSON.stringify(ret))
      }
      currentStorage = clearRequestQueue(uid, storageName)
    }
  }



  const initStorageArr = JSON.parse(currentStorage)


  if(initStorageArr.length) {
    initStorageArr.forEach(resolveRequest)
  }

  const subscribe = fromEvent(element, 'storage').pipe(
    map(e => {
      // console.log('storage 触发：', e)
      return e.storageArea[storageName]
    }),
    filter(storagetStr => storagetStr && storagetStr !== currentStorage),
    map(storageStr => {
      if (currentStorage !== storageStr) {

        let newStorageArr = JSON.parse(storageStr)

        let currentStorageArr = JSON.parse(currentStorage || '[]')

        const newReqs = newStorageArr.filter(item => item.windowId !== windowId && !currentStorageArr.some(req => req.uid === item?.uid))

        currentStorage = storageStr

        return newReqs
      }
    }),
    filter(newReqs => newReqs && newReqs.length),
    mergeMap(newReqs => {
      return interval(1).pipe(take(newReqs.length), map(i => newReqs[i]))
    })
  ).subscribe(resolveRequest)

  return subscribe
}


```

### 样例调用代码

```javascript
// 原本通过http请求的接口，改为通过localStorage请求，从其他页签获得返回值


/*页签A，可以进行网络请求*/
// http请求
const listeners = {
  someEvent: (params) => request.get('/api/xxx', params)
}

// 使用localStorage的监听代码（在可以进行网络请求的页签上监听）
const subscription = Object.keys(listeners).map( key => addApiListener(key, listeners[key]))
    
// 直接调用代码
const response = listeners['someEvent'](params)
    

/*页签B，不可以进行网络请求*/
// 使用localStorage的调用代码
const response = storageRequest('someEvent', [params])

// 两个response在resolve之后的值是一样的
    
```
