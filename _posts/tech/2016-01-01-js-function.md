---
layout: post
title: Javascript Function
category: tech
excerpt:  Javascript函数相关
tags: [javascript, 总结]
---

# () IIFE
> 自执行
```javascript
var f = (function f(){ return "1"; }, function g(){ return 2; })();
typeof f; // number `f` is 2
```

> 传参
```javascript
(function(foo){
    return typeof foo.bar; // foo.foo.bar
})({ foo: { bar: 1 } });
// undefined
```

# call
```javascript
function list() {
    return Array.prototype.slice.call(arguments);
}
```
call(thisArgs, args1, args2, args...)
这里 `arguments` 就是指thisArgs. 这类都必须指定上下文

# bind
```javascript
function list() {
 console.log(arguments);
 return Array.prototype.slice.call(arguments);
}
var leadingThirtysevenList = list.bind(null, [69, 37], {a: 2});
var list2 = leadingThirtysevenList(); // [[]69,37], {a:2}]
var list3 = leadingThirtysevenList(1, 2, 3); // [[69,37],{a:2}, 1, 2, 3]
```
这里`bind`函数给list绑定了一个`null`的上下文, 并且传入两个默认参数.
但这不影响内层call继续使用arguments作为上下文.


# apply
- 函数处于非严格模式下, 指定null, undefined时会自动指向全局对象.
- 值为原始值（数字，字符串，布尔值）的 this 会指向该原始值的自动包装对象。

## GeneratorFunction
> `GeneratorFunction`不是一个全局对象，只能通过以下方式拿到：
```javascript
Object.getPrototypeOf(function*(){}).constructor
var gFC = Object.getPrototypeOf(function*(){}).constructor
// 使用构造函数构造一个生成器函数
var gF = new gFC(function() { yield 1});
var gen = gF(); // 生成构造器 Generator
gen.next();
```

## 判断是否是构造器
```javascript
Object.prototype.toString.call(gFC) === "[Function GeneratorFunction]" ;
```

## 判断是否为Generator
```javascript
typeof gen.next === 'function'
```