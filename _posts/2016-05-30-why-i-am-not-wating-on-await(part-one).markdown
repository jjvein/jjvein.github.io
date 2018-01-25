---
layout: post
title: "Why I\'m Not Waiting On \'await\' (part 1)"
date: 2016-05-30 00:00:00 +0800
category: tech
tags: [nodejs, javascript, es7, await, async]
---

原文地址: [为何等不及用'await'](https://blog.getify.com/not-awaiting-1/?utm_source=javascriptweekly&utm_medium=email)

Two-part series on the highs and lows of the coming async..await in JS:

* Part 1: `what async..await` is and why it’s awesome
* Part 2: why `async..await` falls short compared to generators+promises

The hype is strong for the async..await syntax that’s likely getting official spec approval for ES2017, but has already landed in v8 and Microsoft Edge, at least. And in some ways, async await is very promising and the hype is well deserved.

In fact, it seems even before we got Promises in ES6, most developers were already desperately pining for async function so they could escape some the vagaries of the Promise API and promise chain hell. There’s no doubt that a lot of code will be improved as we move callbacks to promises, and then from promises to promise-driven async functions.

But is async..await our long-awaited white knight? Is it really the only future of async flow control programming in JavaScript?
I like the pattern that async..await signals. Really, I do. It’s a pattern I’ve been advocating for several years now, since even before ES6 landed. But the substance of async..await leaves me hanging in a few places.

### Why The Hype?
Put simply, an async function promotes inside it a synchronous-looking style of flow control (value resolution, error handling).
Each asynchronous step — usually the retrieval of a value or waiting for an action to finish — is modeled with a Promise. But instead of having to .then(..) the promise and provide a function to receive this value/completion, the await keyword is able to locally block while waiting to unwrap the promise.
It’s better to illustrate with code. Here’s three versions of the same (fictional) code, one with callbacks, one with promise chains, and the final with async..await.
First, callbacks:

```
function getOrderDetails(orderID,cb) {
  db.find( "orders", orderID, function(err,order){
    if (!err) {
      db.find(
        "customers",
        order.customerID,
        function(err,customer){
          if (!err) {
            order.customer = customer;
            cb( null, order );
          }
          else cb(err);
        }
      );
    }
    else cb(err);
  });
}

getOrderDetails( 1234, function(err,order){
  if (!err) {
    displayOrder(order);
  }
  else showError(err);
});
```

> Update: Some readers expressed disdain at the usage of nested function expressions here, since it’s putting the worst light on the visual aesthetic of callbacks. That’s not actually my argument in this post — that they’re ugly — but I can see why it would be distracting to my overall points for those who prefer more readable callback style code.

Here’s a comparison between this version and using separate function declarations for each. I think the readability is definitely better. But, that’s just an aside; the virtues of promises are about far more than just nesting/indentation/readability. That discussion is for another post.
No sense in belaboring explanation of this code too much. That’s not really the point of the post. But do notice that error handling is intertwined with and cluttering up the flow control of data, and that we have to nest functions to express their temporal dependence (one has to start after the other finishes, etc).
OK, now the promises version:

```
function getOrderDetails(orderID) {
  return db.find( "orders", orderID )
    .then(function(order){
      return db.find( "customers", order.customerID )
        .then(function(customer){
          order.customer = customer;
          return order;
        });
    });
}

getOrderDetails( 1234 )
.then( displayOrder, showError );
```

Phew! That’s a lot better.

Crucially, we see here that the error handling part of the flow control becomes implicit (and thus hidden), which declutters the code. If any error happens at any depth of this promise chain, it’ll propagate out and get handled by showError(..) — we don’t need to manually push it out.
We still have to use functions to unwrap our promises, though. And indeed, we also still have some unfortunate nesting going on. The reason the then(function(customer).. has to be nested instead of chained off the top-level promise chain in getOrderDetails(..) is because we need lexical scope access to order so we can combine order and customer into a single value to pass along.

OK, so what’s async..await going to do for us?

```
async function getOrderDetails(orderID) {
  var order = await db.find( "orders", orderID );

  var customer = await db.find( "customers", order.customerID );

  order.customer = customer;
  return order;
}

getOrderDetails( 1234 )
.then( displayOrder, showError );
```

Wow. Just wow.
The await keyword locally blocks to wait on the promise that db.find(..) gives us, meaning once it resolves, we’ll get the order we can then synchronously assign to order; same for customer.
If either of those results in a rejected promise (generally, an error), a synchronous exception is thrown at that point in the flow of getOrderDetails(..), and the rest of that function body won’t run.
And, since getOrderDetails(..) is an async function, it makes its promise. Any uncaught exception inside it becomes a rejection of that promise, so we route either to displayOrder(..) or showError(..) implicitly.

If the getOrderDetails( 1234 ) call was itself inside an async function, it would use the same await unwrapping trick along with the ol’ synchronous, familiar try..catch:

```
async function main() {
  try {
    showOrder( await getOrderDetails( 1234 ) );
  }
  catch (err) {
    showError( err );
  }
}
```
The await unwrapping magic is nice to facilitate asynchronous function composition.

Is the implicit error routing of the former snippet better than the explicit form here in the latter? I prefer the explicit handling at the end of the path. I like that promises implicitly pass along rejections, but at the end of the line when it’s time to handle the error, I think that explicit try..catch is much clearer.

### Have We Seen This Before?
Are you sold on async..await yet? I think they’re pretty cool.
But as I’m a true blooded hipster, I liked this pattern before the rest of you thought it was cool.
Way back in ES6, we could actually do this same pattern, just with slightly different vocabulary: Generators and yield (with promises):

```
function *getOrderDetails(orderID) {
  var order = yield db.find( "orders", orderID );

  var customer = yield db.find( "customers", order.customerID );

  order.customer = customer;
  return order;
}

run( getOrderDetails( 1234 ) )
.then( displayOrder, showError );
```

What’s different from async..await? Well, we see that ugly * there instead of the prettier async word. We also see yield instead of await. And lastly, we see usage of run(..) — where the heck does that come from?

I’ve written extensively before about using generators and promises to facilitate this synchronous-async pattern before, and about why that’s so important. Read those if you’re not sure what is going on in that above snippet.

The short version is that generators don’t come out-of-the-box with knowing how to receive a yielded promise and how to resume when it finishes. So we conjure a run(..) function that is smart enough. I won’t show the implementation of it here, but it’s listed in the first of those two links, and it’s only about 25 LoC even with comments — not too difficult, but not a detail to get tripped up on here.

The point is, run(..) is a known-quantity, and can be (and is!) easily provided by various async-helper libraries so you don’t have to worry about it, but just use it.
Of course, I think you should eventually learn how it works, and that’s what those other readings will teach you. But for now, let’s just use it as-is.

### A Rose By Any Other Name…
Is an async function just nicer syntactic sugar for a generator with a run(..) utility driving it?

__No__. But I can see why most people find that natural/comforting to assume.

Let’s start with yield and await. I think it’s fair to claim that yield is imperative while await is declarative, but that may take a bit more explanation to convince you.
yield is inexorably connected to the process of locally pausing to yield control to some external facility, and, if appropriate, eventually resume the generator. The sending of a value, and the receiving of a value back, are entirely optional; the return of control is all that really matters. We’re imperatively saying “yield control to somewhere else and wait until its given back”. yield is primarily a control-transfer mechanism.

With await, we’ve covered up all the mechanics and semantics of any external control involved; the engine itself does that run(..) work for us. As far as we’re concerned, semantically, control never leaves our local function, we just sort of sit and await for processing to finish so we can move on to the next line.
Also, the usage of await seems to be a bit more focused on value semantics than yield. “What is this line waiting on?”” It’s waiting on a value. Would you use await just for pausing and not capturing any return value? I don’t think that’d be as natural, because the whole notion of transfer of control is hidden, conceptually and syntactically.

Taking promises out of the equation for a moment, you could use yield; in a generator to just simply transfer control elsewhere for awhile, and neither have a value you’re sending out nor have a value you’re expecting back.

But you can’t await;.
The await keyword has to always explicitly be awaiting on a promise. Even if you did await undefined or await 3, those immediate values are implicitly wrapped in an already-resolved promise, which is then awaited.

In other words, await is declarative in that it’s saying “await on this value until it’s ready”. The how of that is entirely hidden so we aren’t even thinking about it. Even if under the covers, the browser did exactly the same steps with await that would be done with a yield, the mental models and the syntax surface area are declarative for await and imperative for yield.
We all like declarative forms, though. So that seems like a clear win, right?
The downside is when a declarative form removes important functional characteristics.

### Just Use Both?
In part two of this blog post, I’m going to explain my specific reservations of async functions.
But to conclude this post, let me address the most obvious question floating in the air right now: if async function is nice for syntactic sugar, and generators+promises can do more powerful things when needed, why not just use both?

We wouldn’t need a part two blog post if I felt the world was that easy!
The concern I have with mixing async function and generator is that the composition of the two is more awkward. It’s easy from a generator to yield foo() if foo() is an async function, but it’s weirder from an async function to await run( foo() ) if foo() is a generator.
By “weirder”, I mean that it pushes that extra run(..) tax out to every call-site of foo(), but if most of your code is based around async function, you’re pretty likely to forget that you need to put run(..) in there.

Unfortunately, you won’t necessarily detect this error like you’d expect. Since await automatically promise-wraps any non-promise values, it’ll just promise-wrap the iterator that comes back from your generator invocation, never having run any of the code in the generator at all! And since the value is a non-promise, the wrapped promise will immediately resolve, meaning await unwraps it right away.

The take-away is that mixing the two in the same code base is going to be error-prone. I’m not just predicting… I’ve tried it, and made these mistakes. Many times.
Check out part two where I explain the reasons I plan to stick with generators+promises instead of jumping on the async function bandwagon.
