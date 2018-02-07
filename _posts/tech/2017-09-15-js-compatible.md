---
layout: post
title: Javascript Compatible
category: tech
excerpt: JS compatible
tags: [javascript]
---

# < IE9 不支持catch, finally
`catch`/`finally`在IE<9为关键字, 通过 `promise.catch(func)`/`promise.finally(func)`语法会报错.
> 解决办法
```javascript
promise["catch"](function() {});
promise["finally"](function() {});
```
