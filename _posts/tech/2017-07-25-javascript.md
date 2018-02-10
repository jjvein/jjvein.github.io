---
layout: post
title: Javascript
category: tech
excerpt:  Javascript 个人总结
tags: [javascript, 总结]
---

# Number
## Number 范围
浮点数范围：

as  large  as ±1.7976931348623157 × 10的308次方
as small as ±5 × 10的−324次方
精确整数范围：

The JavaScript number format allows you to exactly represent all integers between
−9007199254740992  and 9007199254740992 （即正负2的53次方）
数组索引还有位操作：

正负2的31次方

> check a number
```javascript
function isNumber(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}
```

> Js Number
```javascript
0.1 + 0.2 == 0.3 ?
+0 === -0 // true
NaN === NaN // false
Object.is(+0, -0) // false
Object.is(NaN, NaN) // true
Object.is(+NaN, -NaN) // true
```

# 闭包
> 闭包是一个函数,捕获作用域内的外部绑定.
闭包的基本原理: 如果一个函数包含内部函数, 那么它们都可以看到其中声明的变量; 这些变量被称为
"自由变量", 这些变量可以被内部函数捕获, 从高阶函数中return实现了"越狱".

## web worker
HTML5 提出Web Worker标准，允许JavaScript脚本创建多个线程，但是子线程完全受主线程控制，不得操作DOM。
- 多个线程同时操作一个DOM节点容易造成混乱！

# async
## setTimeout

> event table
```javascript
setTimeout(() => console.log("3s后执行"), 3000);
```
以上代码执行时，会将回调函数添加到`event table`中，3s以后会被推向`event loop`中，
若此时主线程被block住，则`event loop`也无法立刻执行。

> 判断执行顺序
```javascript
function async() {
	setTimeout(function() {
		setTimeout(function() {
			console.log(2);
		}, 100);
	}, 0);
	setTimeout(function() {
		console.log(1);
	}, 100);
}
// 1, 2
function async() {
	setTimeout(function() {
		setTimeout(function() {
			console.log(2);
		}, 100);
	}, 0);
	setTimeout(function() {
		console.log(1);
	}, 101);
}
// 这里不确定, 有可能是1, 2, 或者2, 1, 收到代码执行时间的影响.
```

# 正则
## 循环匹配
```javascript
let pattern=/\b[a-z]+(\d+)/g // \b 匹配字符开始
let str='p123 q123'
let match
while((match=pattern.exec(str)) !=null){
	console.log(match)
}
> ["p123", "123", index: 0, input: "p123 q123"]
  ["q123", "123", index: 5, input: "p123 q123"]
```

# string
> trim
```javascript
String.prototype.trim = function(){
    return this.replace(/^s+|s+$/g, "");
};
```

## string 类型判断
```javascript
var a = new String('hello');
var b = String('hello');
var c = 'hello';
typeof a // object
typeof b // string
typeof c // string
a instanceof String // true
b instanceof String // false
```

# typeof, instanceof, literal
## typeof
`Boolean`、`String`、`Number`
`Function`、`undefined`

## instanceof
Array、Date、

## Literal
String, Boolean, Array, Function, Object, Number

| Explicit(Bad)     |    Literal(Good) |
| :-------- | :--------|
| `var a = new Object(); a.gree = "hello"`  | `var a = { greet: "hello"` |
| `var b = new Boolean(true);`     |    `var b = true; `|
| `var c = new Array("one", "two");` | `var c = ["one", "two"];` |
| `var d = new String("hello");` | `var d = "hello"` |
| `var e = new Function("greeting", "alert("greeting")`| `var e = function(greeting) { alert(greeting);};`|
| `var f = new Number(1.2);` | `var f = 1.2l` |


# function

## () IIFE
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

## call
```javascript
function list() {
    return Array.prototype.slice.call(arguments);
}
```
call(thisArgs, args1, args2, args...)
这里 `arguments` 就是指thisArgs. 这类都必须指定上下文

## bind
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

### 判断是否是构造器
```javascript
Object.prototype.toString.call(gFC) === "[Function GeneratorFunction]" ;
```

### 判断是否为Generator
```javascript
typeof gen.next === 'function'
```

# iterator

```javascript
function *createIterator() {
    yield 1;
    return;
    yield 2;
    yield 3;
}
let iterator = createIterator();
console.log(iterator.next());
console.log(iterator.next());
```

## hoist

```javascript
var name = 'World!';
(function () {
    if (typeof name === 'undefined') {
        var name = 'Jack';
        console.log('Goodbye ' + name);
    } else {
        console.log('Hello ' + name);
    }
})();
```
如果将`var` 换成 `let`， 得到的结果将完全不同，因为`let`不会发生变量名提升。


## [0] == true ?
```javascript
var a = [0];
if ([0]) { // 可能判断的是对象的地址
  console.log(a == true);
} else {
  console.log("wut");
}
```

## arguments
```javascript
function sidEffecting(ary) {
  ary[0] = ary[2];
}
function bar(a,b,c) {
  c = 10
  sidEffecting(arguments);
  return a + b + c;
}
bar(1,1,1); // 21
// arguments 是一个 object, c 就是 arguments[2], 所以对于 c 的修改就是对 arguments[2] 的修改.
// 当函数参数涉及到 any rest parameters, any default parameters or any destructured parameters 的时候, 这个 arguments 就不在是一个 mapped arguments object

function sidEffecting(ary) {
  ary[0] = ary[2];
}
function bar(a,b,c=3) {
  c = 10
  sidEffecting(arguments);
  return a + b + c;
}
bar(1,1,1); // 12
```

## date
```javascript
var a = Date(0); // 当前时间, 字符串类型
var b = new Date(0); // 1970年
var c = new Date(); // 当前时间， date类型
[a === b, b === c, a === c];
```

## parseInt
```javascript
parseInt(3, 8) // 3
parseInt(3, 2) // NaN
parseInt(3, 0) // 3
```

## [] == []
```javascript
[] == [] // false
[1] == [1] // false
[1] == 1 // true
if ([0]) // true
```

# 原型链
![prototype](/images/tech/prototype.jpg)

> 对象具有属性`__proto__`，可称为隐式原型，一个对象的隐式原型指向构造该对象的构造函数的原型，这也保证了实例能够访问在构造函数原型中定义的属性和方法。

```javascript
Object.__proto__ == Function.__proto__; // true
function f() {}
var ff = new f();
ff.__proto__ == f.prototype; // true
```

## 原型继承的好处
- 不使用[父类]的构造方法就创造新的对象实例
- 修改[父类]的prototype可以动态修改所有已经创建的实例
- 可以动态修改一个对象的原型.

## querystring
解析cookie之类的，以后可以参考这种写法。

```javascript
const weirdoString = `name:Sophie;shape:fox;condition:new`;
const result = querystring.parse(weirdoString, `;`, `:`);
```















