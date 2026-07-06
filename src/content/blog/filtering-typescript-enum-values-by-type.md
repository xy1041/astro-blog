---
title: 'TS中如何从枚举中筛选出符合特定条件的枚举值的联合类型'
description: '通过 TypeScript 模板字面量类型与映射类型，从枚举中筛选出符合特定命名规则的枚举值联合类型'
pubDate: '2023-07-13'
heroImage: '../../assets/blog-placeholder-2.jpg'
tags: ['Typescript']
---

# 背景

系统中有多种类型的组件，但是其中有一些组件在类型名称上有共性，并且它们的性质上也有共性，为了将这些有共性的类型筛选出来，需要有一种方式可以通过特定的类型名筛选出这些枚举值并组成一个联合类型，用在需要判断的地方

# 实现

```typescript

enum WidgetTypes {
    
    typeA = 'typeA',
    
    typeB = 'typeB',
    
    // ... 其他类型
    
    // 我们需要的类型名称都是以special_开头的类型
    special_typeC = 'special_typeC',


    special_typeD = 'special_typeD',


    special_typeE = 'special_typeE',
    
}

// 获得这些特别的类型的key的列表
// 该类型实际上为：'special_typeC' | 'special_typeD' | 'special_typeE'
type SpecialTypeKeys = {
    [K in keyof typeof WidgetTypes]: typeof WidgetTypes[K] extends `special_${string}` ? K : never;
}[keyof typeof WidgetTypes];

// 通过这些key取出enum中的枚举值并组成联合类型
// 该类型实际上为：WidgetTypes.special_typeC | WidgetTypes.special_typeD | WidgetTypes.special_typeE
type SpecialWidgetTypes = Pick<typeof WidgetTypes, SpecialTypeKeys>[keyof Pick<typeof WidgetTypes, SpecialTypeKeys>];


```
