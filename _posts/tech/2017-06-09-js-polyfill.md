---
layout: post
title: Javascript String
category: tech
excerpt:  Use ES2017, ES2016 features today.
tags: [javascript]
---

# Babel

# babel-polyfill
您可以使用内置属性`Promise`, `WeakMap`, 静态方法`Array.from`, `Object.asign`, 实例方法`Array.prototype.includes`
generator function.
# regenerator
generator的兼容包

# regenerator-runtime
针对编译器开发的兼容包,

# es6-promise
[es6-promise](https://github.com/stefanpenner/es6-promise/)

# core-js

# 获取global的对象的写法
```javascript
var g = (function() { return this; })() || Function("return this")();
```
这种写法不太兼容CSP

# 兼容conflict
```javascript
var g = (function() { return this; })() || Function("return this")();
var hadRuntime = g.regeneratorRuntime && Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;
var oldRuntime = hadRuntime && g.regeneratorRuntime;
g.regeneratorRuntime = undefined;
```

# export方法的特殊写法
```javascript
var global = (function() { return this; })() || Function("return this")();
var runtime;
runtime = global.regeneratorRuntime = typeof module === "object" ? module.exports : {};
```
- 若存在module, runtime指向 module.exports的地址, 直接导出
- 若不存在module, global.regeneratorRuntime 和 runtime 都指向了空{}, 给runtime添加属性就是改变空对象
- 这种写法很棒.

# fetch polyfill
- [window.fetch polyfill](https://github.com/github/fetch)
- [fetch specification](https://fetch.spec.whatwg.org/)

# HTML5 Blog
[HTML5 Blob implementation](https://github.com/eligrey/Blob.js)

# FileSaver
[HTML5 saveAs() FileSeaver implementation](https://github.com/eligrey/FileSaver.js#supported-browsers)

