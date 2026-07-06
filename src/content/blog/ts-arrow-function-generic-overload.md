---
title: '在Typescript中重载泛型函数组件以实现以某些参数控制其他参数类型的功能'
description: '使用 TypeScript 的 Call Signatures 重载箭头函数与 React 函数组件，实现根据某参数控制其他参数类型的功能'
pubDate: '2023-06-09'
heroImage: '../../assets/blog-placeholder-2.jpg'
tags: ['Typescript', 'React']
---

# 背景

为了实现函数组件的参数类型能够被其他的某个参数传入的具体值控制的功能，需要用重载的方式来定义组件



# 重载箭头函数

函数组件首先是一个箭头函数，因此需要先能够重载箭头函数

在typescript中可以用 `Call Signatures` 方式来重载一个箭头函数：

```typescript

interface ArrowFunc {
    <T>(x: T): T;

    <T>(x: T[]): T[];
}

// 当需要内部用泛型T作为类型定义变量时
const arrowFunc1: ArrowFunc = <T>(x: T): T => {
    if (Array.isArray(x)) {
        return x.map((item) => item) as T
    } else {
        return x;
    }
};

// 当不需要用泛型T作为类型定义变量时
const arrowFunc2: ArrowFunc = (x) => {
    if (Array.isArray(x)) {
        return x.map((item) => item);
    } else {
        return x;
    }
}

// Arrow function overload
function arrowFuncOverload(x: number): number;
function arrowFuncOverload(x: string): string;
function arrowFuncOverload(x: any): any {
    if (typeof x === "number") {
        return x + 1;
    } else {
        return x + "!";
    }
}

const a = arrowFunc1(10); // a is inferred to be `number`
const b = arrowFunc1(["hello", "world"]); // b is inferred to be `string[]`

console.log(arrowFuncOverload(10)); // Output: 11
console.log(arrowFuncOverload("hello"))
```


# 重载React函数组件

在上面的例子中，我们定义了一个名为 `ArrowFunc` 的接口，它包含两个重载函数。我们还定义了一个名为 `arrowFuncOverload`
的函数，它使用重载来支持不同类型的参数。

但是在 `React` 的函数组件中，因为返回值均为`JSX.Element`，需要重载的场景通常为 **需要根据传入的某个参数来限定其他参数的传入类型的场景**，此时的实现方式应当为：

```typescript jsx

interface FuncComponentProps<R extends boolean> {
    trigger: R,
    changedParams: R extends true ? number : string
}

interface FuncComponent {
    <T>(props: FuncComponentProps<true>): JSX.Element;

    <T>(props: FuncComponentProps<false>): JSX.Element;
}

const FuncComponent1: FuncComponent = <R extends boolean>(props: FuncComponentProps<R>) => {

    const {trigger, changedParams} = props

    let showX: R

    showX = trigger

    let text = ''

    if (trigger) {
        // 函数内部需要显式指定changedParams的类型，泛型推断仅对外部在调用组件时传入不同的参数时有效
        text = (changedParams as number).toString()
    } else {
        text = changedParams as string
    }

    return <div>{text} </div>
};

// 当不需要用泛型T作为类型定义变量时
const FuncComponent2: FuncComponent = (props) => {

    const {trigger, changedParams} = props


    let text = ''

    if (trigger) {
        // 函数内部需要显式指定changedParams的类型，泛型推断仅对外部在调用组件时传入不同的参数时有效
        text = (changedParams as number).toString()
    } else {
        text = changedParams as string
    }

    return <div>{text} </div>
};

const ShowFuncComponent = () => {

    return <div>
        <FuncComponent1
            trigger={true} // trigger=true, changedParams只接受number
            // changedParams={'1'} // 会报错
            changedParams={1}
        />
        <FuncComponent1
            trigger={false} // trigger=false, changedParams只接受string
            // changedParams={1} // 会报错
            changedParams={'1'}
        />
    </div>
}
```

>  ⚠️  需要注意的是，重载使得调用方可以明确知晓自己传入不同参数时受影响的参数的类型，但组件内部是无从得知的，如果类型变化，需要编写者自己显式指定什么条件下会变化类型的参数是什么类型

上面的例子中，我们以trigger参数作为触发changedParams参数类型变化的触发器，实现了外部传入不同的参数值时被控制的参数的要求类型不同的功能，该写法可以实现包括但不限于以下需求：

- 根据传入是否必填参数修改onChange的参数是否可以为空
- 根据传入的类型参数限定传入的详细数据参数的结构类型


# 参考

- [[1] TypeScript: Documentation - Call Signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html#call-signatures) 
- [[2] TS 中箭头函数如何重载](https://juejin.cn/post/7236634852829052983)
