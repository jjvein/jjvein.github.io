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

# array

> 生成0-100之间的数组
```javascript
var numbersArray = [] , max = 100;
for( var i=1; numbersArray.push(i++) < max;);  // numbers = [1,2,3 ... 100]
```

> check array
```javascript
Object.prototype.toString.call([]);
// => [object Array]
```

> copy an array
```javascript
var arr = [1, 2, 3];
var b = arr.slice();
var b = [...arr]; // as well
```

> Array.of vs Array.from
```
Array.of(7);
var a = new Set(1, 3, 5);
Array.from(a);
```

> Array.map
```javascript
[1, 2, 3].map(n => { number: n })
// 将其解析为代码块；
// [undefined, undefined, undefined]
[1, 2, 3].map(n => ({ number: n }));
```

> Array.prototype.reduce
```javascript
var arr = [{
  gender: 'man',
  name: 'john'
}, {
  gender: 'woman',
  name: 'mark'
}, {
  gender: 'man',
  name: 'jerry'
}];
var filtered = arr.reduce((a, b) => {
	if (b.gender != 'woman') return a.concat(b.name);
	else return a;
}, []);
```

> reduceRight
```javascript
let flattened = [[1,2], [2,3], [3, 4]].reduceRight((a, b) => a.concat(b.reverse()), []);
```
可以将数组从后往前拍平返回。

> 稀疏数组
```javascript
Array.apply(null, Array(3)).map(Function.prototype.call.bind(Number))
```


## 数组去重

> 解法一:
```javascript
var spread = [12, 5, 8, 8, 130, 44, 130];
var filtered = spread.filter((item, index, arr) => {
    return arr.indexOf(item) == index;
});
```

> 解法二:
```javascript
var spread = [12, 5, 8, 8, 130, 44, 130];
var filtered = [...new Set(spread)];
```

## swap
```javascript
let a = 1,
    b = 2;
[ a, b ] = [ b, a ];
console.log(a);
console.log(b);
```

## Map

```javascript
var map = new Map([[NaN, 1], [Symbol(), 2], [Symbol(), 3], ['foo', 'bar']]);
console.log(map.has(NaN));
console.log(map.has(Symbol()));
// Map { NaN => 1, Symbol() => 2, 'foo' => 'bar', Symbol() => 3 }
```

## 判断数组
```javascript
var a = [];
a instanceof Array;
a.constructor === Array // true
// 判断a的prototype
Array.prototype.isPrototypeOf(a);  // true
Object.getPrototypeOf(a) === Array.prototype; // true
Object.prototype.toString.apply(a) === '[object Array]'; // true
Array.isArray(a);
```


# string
> trim
```javascript
String.prototype.trim = function(){
    return this.replace(/^s+|s+$/g, "");
};
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


| First cell|Second cell|Third cell
| First | Second | Third |

First | Second | | Fourth |


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
    return typeof foo.bar;
})({ foo: { bar: 1 } });
```

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

> 判断是否是构造器
```javascript
Object.prototype.toString.call(gFC) === "[Function GeneratorFunction]" ;
```

> 判断是否为Generator
```javascript
typeof gen.next === 'function'
```


# Object
## defineProperty
```javascript
const a = { b: 'c'}
Object.defineProperty(a, 'visible', { enumerable: false, value: 'boo! ahhh!' })
Object.assign({}, a);
```



## destruct

```javascript
let node = { type: "Identifier" };
let { type: localType = 'foo', name: localName = 'bar' } = node;
console.log(localType);
console.log(localName);
```


## iterator

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



## String
```javascript
var a = new String('hello');
var b = String('hello');
var c = 'hello';
typeof a
typeof b
typeof c
a instanceof String
b instanceof String
```

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

## 原型链
![prototype](/images/tech/prototype.jpg)

> 对象具有属性`__proto__`，可称为隐式原型，一个对象的隐式原型指向构造该对象的构造函数的原型，这也保证了实例能够访问在构造函数原型中定义的属性和方法。

```javascript
Object.__proto__ == Function.__proto__; // true

function f() {}
var ff = new f();
ff.__proto__ == f.prototype; // true
```

> 原型继承的好处
- 不使用[父类]的构造方法就创造新的对象实例
- 修改[父类]的prototype可以动态修改所有已经创建的实例
- 可以动态修改一个对象的原型.

## querystring
解析cookie之类的，以后可以参考这种写法。

```javascript
const weirdoString = `name:Sophie;shape:fox;condition:new`;
const result = querystring.parse(weirdoString, `;`, `:`);
```

## 创建对象的3种方法
### 字面量

```javascript
var o1 = { name: "01" };
```

### 构造函数

```javascript
var o2 = new Object({ name: 'lynk & co 01' });
var M = function(name) { this.name = name; };
var o3 = new M('03')
```

### Object.create
```javascript
var p = { name: "p4" };
var o4 = Object.create(p);
```

## 继承的几种方式
### 借用构造函数实现继承

```javascript
function Parent() {
    this.name = 'parent';
}
function Child() {
    Parent.call(this);
    this.type = 'child';
}
var child = new Child();
```
> Child1无法继承Parent1的原型对象，并没有真正的实现继承（部分继承）

### 借用原型链实现继承

```javascript
function Parent1() {
    this.name = 'parent1';
}
function Child1() {
    this.type = 'child1'
}
Child1.prototype = new Parent1();
```
> 原型对象的属性是共享的。

### 组合式继承
```javascript
function Parent2() {
    this.name = 'parent2';
}
function Child2() {
    Parent2.call(this);
    this.type = 'child2';
}
Child2.prototype = Object.create(Parent2.prototype);
Child2.prototype.constructor = Child2;
```

## microtask vs macrotask
https://www.jianshu.com/p/3ed992529cfc
执行的优先级：
```javascript
process.nextTick > promise.then > setTimeout > setImmediate
```

```javascript
macrotasks: script(整体代码),setTimeout, setInterval, setImmediate, I/O, UI rendering

microtasks: process.nextTick, Promises, Object.observe, MutationObserver
```

- 所有的代码是`macrotask queue`的第一个任务；代码执行完之后，分别在`macrotask queue`和`microtask queue`中注册了任务
- 调用`microtask queue`中的所有任务。














