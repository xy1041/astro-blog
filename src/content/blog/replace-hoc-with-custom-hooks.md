---
title: '用自定义Hooks替代HOC（高阶组件）'
description: '通过长期使用 React Hooks 的实践，记录用自定义 Hook 替代高阶组件实现逻辑复用的方案'
pubDate: '2022-07-13'
heroImage: '../../assets/blog-placeholder-5.jpg'
tags: ['React', 'Hooks']
---

## 概述

经过长时间的对React Hooks的使用，最终我认为，HOC的功能在绝大多数场景中都可以被自定义的Hooks取代，特此记录。

## HOC

HOC（High Order Component），即高阶组件

> 高阶组件（HOC）是 React 中用于复用组件逻辑的一种高级技巧。HOC 自身不是 React API 的一部分，它是一种基于 React 的组合特性而形成的设计模式。
>
>
> -- React文档，高阶组件

高阶组件在使用中的用途基本上是实现部分抽象逻辑的复用，如Redux官方提供的connect函数，还有react-router提供的withRouter函数，它们都是为了给被该函数包含的组件的props提供一个或多个额外的props属性而使用的。

同时使用withRouter和connect, 也是大部分项目中嵌套使用HOC的方式:
```javascript

import { withRouter } from 'react-router'
import { connect } from 'react-redux'


const RouterComponent = (props) => {
  // withRouter hoc给RouterComponent增加了match、location、history三个props属性
  const { match, location, history } = props
  
  // connect hoc给RouterComponent增加了state和dispatch两个属性
  const {state, dispatch} = props

}

const mapStateToProps = (state) => ({state})

const mapDispatchToProps = (dispatch) => ({dispatch})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RouterComponent))

```

HOC确实在一定程度上解决了逻辑的抽象的需求，但是它也有以下缺陷：
- HOC本质上将需要共用的逻辑向上提升，作为父组件给包裹组件添加props，如果一个组件需要利用多个HOC则很容易产生嵌套地狱
- 因为HOC可以劫持props，在编写者不遵守约定的情况下可能造成冲突。
- HOC向包裹组件传入的props并没有标识来源，在实际使用的过程中很容易出现为了找出该props的来源不断向上溯源的情况

而这些问题，在使用hooks替代HOC的功能之后都可以得到解决

## React Hooks

> Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。
> 
> -- React文档 Hook概览

React Hooks最初设计就是为了解决Class组件和HOC无法解决或者带来的结构性问题，具体的动机可以查看 [React文档中的动机说明](https://zh-hans.reactjs.org/docs/hooks-intro.html#motivation)

下面是一个使用React Hooks实现上面用HOC实现的功能的例子

```javascript
import {useDispatch, useSelector} from 'react-redux' // redux为react-hooks提供的自定义hooks
import {useLocation, useHistory, useRouteMatch, useParams} from 'react-router-dom' // react-router-dom为react-hooks提供的自定义hooks

const RouterComponent = (props) => {
  const dispatch = useDispatch()
  
  const reduxState = useSelector((state) => state)
  
  const location = useLocation()
  
  const history = useHistory()
  
  const match = useRouterMatch()
  
  const params = useParams()
  
  
}

export default RouterComponent

```

可以看到这里获得的所有内容均由hooks提供，不需要思考来源，因为hooks已经作为自然的标注告知了数据的来源，也不用担心会改写和覆盖真的由上层业务组件传来的props参数，因为它们已经分离了

但是你可能会觉得每个组件都这样写过于繁琐，此时编写自定义hooks就显得必要。

## 自定义Hook

自定义Hook是伴随React Hook到来的一个和HOC类似的逻辑复用实现方案，不同的是它是在组件内部被调用，而不是将组件作为参数调用，结构上的变化使得自定义Hook比HOC能更清晰的将逻辑复用

使用自定义Hook实现上文中的功能的例子：

```javascript
import {useDispatch, useSelector} from 'react-redux' // redux为react-hooks提供的自定义hooks
import {useLocation, useHistory, useRouteMatch, useParams} from 'react-router-dom' // react-router-dom为react-hooks提供的自定义hooks


const useRouterAndRedux = () => {
  
  const dispatch = useDispatch()

  const reduxState = useSelector((state) => state)

  const location = useLocation()

  const history = useHistory()

  const match = useRouterMatch()

  const params = useParams()
  
  return {match, location, history, params, state: reduxState, dispatch}
}

const RouterComponent = (props) => {
  
  const {match, location, history, params, state, dispatch} = useRouterAndRedux()
  
}

export default RouterComponent

```
这样实现之后，其他的组件如果需要Router中的属性或者Redux的相关数据，只需要一样调用 `useRouterAndRedux` Hook即可

同时，自定义组件也可以允许开发者更好地复用在生命周期变化时触发的处理逻辑

比如处理因为dom操作而产生关联变化的数据

在Class Component中：

```jsx

class DomComponent extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      countSqrt: 0,
      
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevState.count !== this.state.count) {
      this.setState({
        countSqrt: Math.sqrt(this.state.count)
      })
    }
  }

  addCount() {
    this.setState(({count}) => {
      count: count + 1
    })
  }

  render() {
    
    return <div>
      计数：{this.state.count}
      计数开方：{this.state.countSqrt}
      <button onClick={addCount}> + </button>
    </div>
  }
}

export default DomComponent

```

当希望复用获得开方这个逻辑时，可能要复制很多代码到`constructor`和`componentDidUpdate`函数里，如果用自定义Hook实现，就会简化和直观得多

```jsx

const useCountSqrt = () => {
  const [countSqrt, setCountSqrt] = useState(0)

  const [count, setCount] = useState(0)

  const addCount = () => {
      setCount(count + 1)
  }

  useEffect(() => {
    setCountSqrt(Math.sqrt(count))
  }, [count])
  
  return [count, countSqrt, addCount]
}


const DomComponent = (props) => {
  
  
  
  const [count, countSqrt, addCount] = useCountSqrt()


  return <div>
    计数：{count}
    计数开方：{countSqrt}
    <button onClick={addCount}> + </button>
  </div>
  
}


```

可以看到，useEffect Hook的第二个参数明确要求用户提供数据变化的条件，能够更加清晰的辨别哪些数据变化的时候触发哪些行为。

这样一来，其他的组件中需要用到这个获得开方数据的复用逻辑（这只是一个比较简单的例子，指代任何拥有复杂内部结构的复用逻辑）


## 总结

`React Hook`相比`HOC`和本文未提到的`Render props`，可以使逻辑复用更加清晰、友好、低耦合和易读，而自定义Hook的出现，使得所有逻辑都可以被封装为一个自定义Hook，自然业务端有许多复杂问题需要具体分析和解决，但React Hook为我们提供了一个基础很好的工具来解决这些问题。

但是，React Hook也有自己的限制，当需要根据变化前的状态判断是否需要更新state时，hook就会变得无能为力，这一点可以跟踪官方issue [Provide more ways to bail out inside Hooks](https://github.com/facebook/react/issues/14110) 进行跟进观察
## 参考

- [React文档 - 高阶组件](https://zh-hans.reactjs.org/docs/higher-order-components.html)
- [React文档 - Hook](https://zh-hans.reactjs.org/docs/hooks-overview.html)
- [HOCs vs Hooks，what to use and why](https://devcore.io/en/react/hocs-vs-hooks-what-to-use-and-why/)
- [从Mixin到HOC再到Hook](https://juejin.cn/post/6844903815762673671)
