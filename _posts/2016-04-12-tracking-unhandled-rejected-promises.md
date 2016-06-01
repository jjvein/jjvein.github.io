---
layout: post
title: Tracking unhandled rejected Promises
date: 2016-04-12 08:00:00 +800
excerpt: unhandledrejection, unhandledrejection事件,rejectionhandled,chrome 49+
categories: nodejs exception
tags: [nodejs, event, exception, unhandledrejection, rejectionhandled]
---

[Tracking unhandled rejected Promises](http://www.2ality.com/2016/04/unhandled-rejections.html)

Labels: async, dev, esnext, javascript, promises

In Promise-based asynchronous code, rejections are used for error handling. One risk is that rejections may get lost, leading to silent failures. For example:

    function main() {
        asyncFunc()
        .then(···)
        .then(() => console.log('Done!'));
    }

If asyncFunc() rejects the Promise it returns then that rejection will never be handled anywhere.

Let’s look at how you can track unhandled rejections in browsers and in Node.js.

### 1. Unhandled rejections in browsers
Some browsers (only Chrome at the moment) report unhandled rejections.

#### 1.1 unhandledrejection

Before a rejection is reported, an event is dispatched that you can listen to:

    window.addEventListener('unhandledrejection', event => ···);

The event is an instance of PromiseRejectionEvent whose two most important properties are:

* promise: the Promise that was rejected
* reason: the value with which the Promise was rejected

The following example demonstrates how this event works:

    window.addEventListener('unhandledrejection', event => {
        // Prevent error output on the console:
        event.preventDefault();
        console.log('Reason: ' + event.reason);
    });
    
    function foo() {
        Promise.reject('abc');
    }
    foo();

The output of this code is:

    Reason: abc

#### 1.2 rejectionhandled

If a rejection is initially unhandled, but taken care of later then rejectionhandled is dispatched. You listen to it as follows:

    window.addEventListener('rejectionhandled', event => ···);
event is also an instance of PromiseRejectionEvent.

The following code demonstrates rejectionhandled:

    window.addEventListener('unhandledrejection', event => {
        // Prevent error output on the console:
        event.preventDefault();
        console.log('Reason: ' + event.reason);
    });
    window.addEventListener('rejectionhandled', event => {
        console.log('REJECTIONHANDLED');
    });
    
    
    function foo() {
        return Promise.reject('abc');
    }
    var r = foo();
    setTimeout(() => {
        r.catch(e => {});
    }, 0);
This code outputs:

    Reason: abc
    REJECTIONHANDLED

解释： foo()调用时返回一个未被handledrejection， 通过setTimeout将catch操作放到下一个tick, 这样此处会被unhandledrejection 事件捕获，
nextTick捕获handledrejection, 此操作被rejectionhandled事件捕获。

#### 1.3 Further reading

The Chrome Platform Status site links to a [“Promise Rejection Events Sample”](https://googlechrome.github.io/samples/promise-rejection-events/) that contains an explanation and code.

### 2. Unhandled rejections in Node.js

Node.js does not report unhandled rejections, but it emits events for them. You can register an event listener like this:

    process.on('unhandledRejection', (reason, promise) => ···);
The following code demonstrates how the event works:

    process.on('unhandledRejection', (reason) => {
        console.log('Reason: ' + reason);
    });
    function foo() {
        Promise.reject('abc');
    }
    foo();

### 3. Further reading

The Node.js documentation has [more information on the Event unhandledRejection](https://nodejs.org/api/process.html#process_event_unhandledrejection).

