---
layout: post
title: JS原理
excerpt: "Javascript use Event-driven, non-blocking I/O model which makes it lightweight and efficient."
category: tech
tags: ["js", "原理"]
---

# microtask vs macrotask
[小任务队列 大任务队列](https://www.jianshu.com/p/3ed992529cfc)
> 执行的优先级：
```javascript
process.nextTick > promise.then > setTimeout > setImmediate
```

```javascript
macrotasks: script(整体代码),setTimeout, setInterval, setImmediate, I/O, UI rendering

microtasks: process.nextTick, Promises, Object.observe, MutationObserver
```

- 所有的代码是`macrotask queue`的第一个任务；代码执行完之后，分别在`macrotask queue`和`microtask queue`中注册了任务
- 调用`microtask queue`中的所有任务。

# Non-blocking I/O
- Http requests
- database operations
- disk reads and writes


# Web Worker 并行
- 新线程
- 独立的message queue
- 独立的event loop
- 独立的内存空间
- 通过message与主线程通信

![Web worker](/images/tech/web-workers.png)

# 异步调用
```javascript
var index = 4;
while (index--) {
    setTimeout(function() { console.log(index); }, 0)
    console.log(index);
}
// 3, 2, 1, 0, -1, -1, -1, -1
```


