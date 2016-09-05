---
layout: post
title: 使用Web Worker来加速JavaScript程序
author: Matt West
category: nodejs
excerpt: 期待使用web worker来完成异步加载, 优化主程序UI卡顿问题.
tags: [javascript, performance, 翻译]
---

[链接地址](http://blog.teamtreehouse.com/using-web-workers-to-speed-up-your-javascript-applications)

The performance of JavaScript applications running in the browser has increased considerably over the past few years. This is mainly due to continued work on the underlying JavaScript engines (such as V8) that actually execute the code. But as these JavaScript engines get faster, our web applications also demand more.

The introduction of JavaScript APIs like the File API has made it possible to write JavaScript applications that are undertaking some serious computational tasks on the client-side. Despite the improvements in JavaScript engines, it is not uncommon for users to encounter frozen user interfaces as the browser works through resource intensive tasks. This leads to a horrible user experience. The purpose of Web Workers is to give developers a way of instructing the browser to process large tasks in the background; therefore preventing the UI from freezing up.

In this blog post you are going to learn how to build multi-thread JavaScript applications using Web Workers. Lets dive right in!

An Introduction to Web Workers and Threads

The JavaScript code that you write will usually execute in a single thread. A thread is like a big todo list. Each statement that you write is added to the list as a task and the browser works its way through this list executing each task one at a time. The problem with a single-threaded architecture is that if a particular task takes a long time to complete everything else is held up until that task finishes. This is known as blocking. In the world of client-side JavaScript applications, using a single-threaded architecture can lead to your app becoming slow or even completely unresponsive.

Web Workers provide a facility for creating new threads for executing your JavaScript code in. Effectively creating a multi-threaded architecture in which the browser can execute multiple tasks at once. Creating new threads for handling large tasks allows you to ensure that your app stays responsive and doesn’t freeze up.

Check out this demo for an example of the performance impact that using workers can have.  First set the number of workers to ‘disabled’ and record the time it takes for the image to be drawn. Then set the number of workers to ‘1’ and run the demo again. You should see a considerable difference in the time it takes to draw the image. If you use more workers it will get even faster.

Now that you have an understanding of the role that web workers play in JavaScript applications lets take a look at how you can use them in your own projects.

Spawning a Worker

Creating Web Workers is a fairly simple task. First you need to create a new JavaScript file that contains all of the code that you want your worker to execute. You then create a new Worker object, passing in the path to the file that contains the code that your worker is to execute.

var worker = new Worker('work.js');
Once you have created your worker you can fire it up using the postMessage() function. Later in this blog post you will learn how to use this function to pass data to a web worker.

worker.postMessage();
That’s it! You now have a functioning web worker that is executing code in its own thread.

NOTE: Creating web workers will spawn real OS-level threads that consume system resources. Just be conscious that this will affect the performance of the user’s whole computer, not just the web browser.

Communicating with a Web Worker

So you now know how to create Web Workers, but for you to be able to use these in real-world applications you need to know how to pass data between your main application and the web worker. You do this using messages. These messages can be either simple strings or JavaScript objects.

To send some data from your main application to a web worker you call the postMessage() function on your worker object.

```
/* File: main-script.js */

var worker = new Worker('respond.js');

worker.postMessage('Hello World');
```

You now need to write some code in your worker script that will listen for, and process, messages coming from the main application. Inside your worker script you would setup an event listener for the message event.

```
/* File: respond.js */

// Setup an event listener that will handle messages sent to the worker.
self.addEventListener('message', function(e) {
  // Send the message back.
  self.postMessage('You said: ' + e.data);
}, false);
```

In this example the worker will prepend the text ‘You said: ‘ to the original message and send it back to the application. When sending data from inside a worker you still use the postMessage() function, however this time you call the function on self.

The final step is to setup an event listener back in the original application that will listen for messages that are sent by the worker.

/* File: main-script.js */

var worker = new Worker('respond.js');

// Setup an event listener that will handle messages received from the worker.
worker.addEventListener('message', function(e) {
  // Log the workers message.
  console.log(e.data);
}, false);

worker.postMessage('Hello World');
The event listener in this example will simply log the message from the worker to the console. The whole communication would look like the following:

Application (to worker): Hello World
Worker: You said: Hello World
Application (to console): You said: Hello World
Terminating a Worker

Once you are done with a worker you can terminate it by calling the terminate() function on your worker object. To have a worker terminate itself you need to call the close() function on self.

// Terminate a worker from your application.
worker.terminate();

// Have a worker terminate itself.
self.close();
You should always use workers responsibly and terminate them when they have finished executing their given task. This helps to free up resources for other applications on the user’s computer.

### Worker 存在的限制

#### Same Origin Policy 同域名策略

worker脚本必须和主文档相同域名, 包括使用协议. 例如你的页面是 https:// 页面就不可以使用 http://的worker.

#### 访问受限

你的worker在主程序之外运行, 它没有像主程序一样的访问权限:

- DOM
- `document` 对象
-  `window`对象
- `parent`对象

如果你想使用worker来协助更新主程序ui, 那么就需要Worker和主程序之间的通信机制, 然后由主程序负责完成UI更新.

#### 受限的本地访问

Worker在使用file://这种协议打开无效. 必须开启本地服务如xampp

Final Thoughts

Web Workers are a core part of HTML5. They allow us to create applications that can harness the power of the client and take advantage of fantastic new technologies without worrying about diminishing the experience for the end-user.

Although web workers have been around for a few years now, adoption by the developer community has sadly been limited. Using web workers can have a significant impact on the performance of our web applications; and more responsive applications tends to lead to happier users. I don’t know anyone that doesn’t want users to have a great experience when using their products.

It would be great to hear how you are using web workers in your own projects. Let us know in the comments below.