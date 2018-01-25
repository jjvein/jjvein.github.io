---
layout: post
title: Promise-based function should not throw exceptions
date: 2016-05-31 19:00:00 +0800
tags: [nodejs, promise, exception]
category: tech
---

[Promise based functiosn should not throw exceptions](http://www.2ality.com/2016/03/promise-rejections-vs-exceptions.html)

This blog post gives tips for error handling in asynchronous, Promise-based functions.

### 1. Operational errors vs. programmer errors

In programs, there are two kinds of errors:

* 1.1 Operational errors happen when a correct program encounters an exceptional situation that requires deviating from the “normal” algorithm. For example, a storage device may run out of memory while the program is writing data to it. This kind of error is expected.

* 1.2 Programmer errors happen when code does something wrong. For example, a function may require a parameter to be a string, but receives a number. This kind of error is unexpected.

### Operational errors: don’t mix rejections and exceptions

For operational errors, each function should support exactly one way of signaling errors. For Promise-based functions that means not mixing rejections and exceptions, which is the same as saying that they shouldn’t throw exceptions.

Programmer errors: fail quickly

For programmer errors, it usually makes sense to fail as quickly as possible:

```
    function downloadFile(url) {
        if (typeof url !== 'string') {
            throw new Error('Illegal argument: ' + url);
        }
        return new Promise(···).
    }
```
Note that this is not a hard and fast rule. You have to decide whether or not you can handle exceptions in a meaningful way in your asynchronous code.

### 2. Handling exceptions in Promise-based functions

If exceptions are thrown inside the callbacks of then() and catch() then that’s not a problem, because these two methods convert them to rejections.

However, things are different if you start your async function by doing something synchronous:

    function asyncFunc() {
        doSomethingSync(); // (A)
        return doSomethingAsync()
        .then(result => {
            ···
        });
    }

If an exception is thrown in line A then the whole function throws an exception. There are two solutions to this problem.

* 2.1 Solution 1: returning a rejected Promise
You can catch exceptions and return them as rejected Promises:

    function asyncFunc() {
        try {
            doSomethingSync();
            return doSomethingAsync()
            .then(result => {
                ···
            });
        } catch (err) {
            return Promise.reject(err);
        }
    }
* 2.2 Solution 2: executing the sync code inside a callback
You can also start a chain of then() method calls via Promise.resolve() and execute the synchronous code inside a callback:

    function asyncFunc() {
        return Promise.resolve()
        .then(() => {
            doSomethingSync();
            return doSomethingAsync();
        })
        .then(result => {
            ···
        });
    }
An alternative is to start the Promise chain via the Promise constructor:

    function asyncFunc() {
        return new Promise((resolve, reject) => {
            doSomethingSync();
            resolve(doSomethingAsync());
        })
        .then(result => {
            ···
        });
    }
This approach saves you a tick (the synchronous code is executed right away), but it makes your code less regular.

### 3. Async functions and exceptions

Brian Terlson points out that async functions reflect a preference for not mixing exceptions and rejections: Originally, if an async function had a default value that threw an exception then the function would throw an exception. Now, the function rejects the Promise it returns.

### 4. Further reading

* [“Error Handling in Node.js”](https://www.joyent.com/developers/node/design/errors) by Joyent
