---
layout: post
title: "Why I\'m Not Waiting On \'await\' (part 2)"
date: 2016-05-30 10:00:00 +0800
category: tech
---

Two-part series on the highs and lows of the coming async..await in JS:

* Part 1: what async..await is and why it’s awesome
* Part 2: why async..await falls short compared to generators+promises

In part one, I covered why async..await has built up such momentum on the hype train. The promise of sync-looking async is powerfully attractive.

Now I’ll cover why I think we should slow that train down. A bunch.

I’m going to make a case for sticking with generators+promises by exploring some shortcomings of async..await. As I’ve already shown, the syntax of generators+promises isn’t that much worse. But they’re more powerful.

### Missing Direct Delegation

Remember in part one where I asserted that yield is more about control transfer than value semantics? That’s more obvious once we look at `yield *`.

In a generator, a yield transfers control back to the calling code. But what if we want to delegate to another piece of code, while still preserving the pause/resume async semantics.
We can instead do a yield * delegation to another generator, like this:

```
function *foo() {
  var x = yield getX();
  var y = yield * bar( x );   // <-- *
  console.log( x, y );
}

function *bar(x) {
  var y = yield getY( x );
  var z = yield getZ( y );
  return y + z;
}

run( foo() );
```

You'll notice that the yield * bar(..) lets the bar() generator run. But how does it run? We didn't use the run(..) utility on that call.

We don't have to, because yield * actually delegates control, so the original run(..) from the last line of the snippet is now transparently controlling (pausing/resuming) the bar() generator as it proceeds, without even knowing it. Once bar() completes, its return value (if any) finally resumes the yield * with that value, returning execution to the foo() generator.

The `yield *` can even be used to create a sort of generator recursion, where a generator instance delegates to another instance of itself.
Because async functions are not about control transfer, there's no equivalent to `yield *` like `await *`. There was talk about appropriating the await \* syntax to mean something like await Promise.all(..), but that was eventually rejected.
The async function equivalent would be:

```
async function foo() {
  var x = await getX();
  var y = await bar( x );
  console.log( x, y );
}

async function bar(x) {
  var y = await getY( x );
  var z = await getZ( y );
  return y + z;
}

foo();
```

We don't need a yield \*-type construct here because bar() creates a promise we can await.

That may seem that it's basically just, again, nicer syntax sugar removing the need for the \*. But it's subtly different. With the `yield *`, we're not creating a wrapper promise but rather just passing control directly through.
What if bar() has some case where it can provide its result right away, such as pulling from a cache/memoization?

```
function *bar(x) {
  if (x in cache) {
    return cache[x];
  }

  var y = yield getY( x );
  var z = yield getZ( y );
  return y + z;
}
```
versus:

```
async function bar(x) {
  if (x in cache) {
    return cache[x];
  }

  var y = await getY( x );
  var z = await getZ( y );
  return y + z;
}
```
In both cases, we immediately return cache[x].

In the yield * case, return immediately terminates the generator instance, so we'd get that result back in foo() right away. But with promises (which is what async functions return), unwrapping is an async step, so we have to wait a tick before we can get that value.
Depending on your situation, that may slow your program down a little bit, especially if you're using that pattern a lot.

### Can't Be Stopped

In part one, I asserted that await is declarative while yield is imperative. Pushing that to a higher level, async functions are declarative and generators are imperative.

An async function is represented by (ie, returns) a promise. This promise represents one of two states: the whole thing finished, or something went wrong and it stopped. In that sense, the async function is an all-or-nothing proposition. But moreover, because it's a promise that's returned, all you can do is observe the outcome, not control it.

By contrast, a generator is represented by (ie, returns) an iterator. The iterator is an external control for each of the steps in the generator. We don't just observe a generator's outcome, we participate in it and control it.

The run(..) function that drives the generator+promise async flow control logic is actually negotiating via the iterator.

The next(..) command on the iterator is how values are sent into the generator, and how values are received from it as it progresses. The iterator also has another method on it called throw(..), which injects an exception into the generator at its paused position; next(..) and throw(..) pair together to signal (from the outside) success or failure of any given step in the generator.

Of course, there's no requirement that the code controlling a generator's iterator choose to keep it going with next(..) or throw(..). Merely opting to stop calling either has the effect of indefinitely pausing the generator. The iterator instance could be left in this paused state until the program ends or it's garbage collected.

Even better, a generator's iterator has a third method on it that can be useful: return(..). This method terminates the generator at its current paused point; you can send an affirmative signal into the generator from the outside telling it to stop right where it sits.

You can even detect and respond to this return(..) signal inside the generator with the finally clause of a try statement; a finally will always be executed, even if the statement inside its associated try was terminated from the outside with an iterator's return(..) method.

A run(..) that was slightly smarter could offer the advantage of allowing a generator to be stopped from the outside.

Imagine a scenario where midway through a generator's steps, you can tell by the values emitted that it's appropriate to stop the progression of the generator -- to cancel any further actions. Maybe the generator makes a series of Ajax calls one after the other, but one of the results signals that none of the others should be made.

Consider a more capable run(..) used like this:

```
run( main(), function shouldTerminate(val){
  if (val == 42) return true;
  return false;
} );
```

Each time a value is ready to be sent in to resume the main() generator, this shouldTerminate(..) function is first called with the value. If it returns true, then the iterator is return(..)d, otherwise the value is sent via next(..).
A generator provides the power of external cancelation capability whereas an async function can only cancel itself. Of course, the necessary cancelation logic can be baked into the async function, but that's not always appropriate.
It's often much more appropriate to separate the async steps themselves from any logic that will consume or control (or cancel) them as a result. With generators that is possible, but with async functions it's not.

### Scheduling Is Hidden
It's tempting to assume that a program should always complete its async steps ASAP. It may be hard to conceive of a situation where you wouldn't want some part of the program to proceed right away.

Let's consider a scenario where we have more than one set of asynchronous logic operating at the same time. For example, we might be making some HTTP requests and we might also be making some database calls. For the sake of this discussion, let's assume that each set of behavior is implemented in its own async function.

Because async functions essentially come with their own run(..) utility built-in, the progression of steps is entirely opaque and advances strictly in ASAP fashion.

But what if you needed to control the scheduling of the resumptions of each task's steps? What if, for the purposes of throttling resource usage, you needed to make sure that no more than one HTTP request/response was handled for each database request?

Another problem could be that one set of async steps might have each step proceed so quickly (essentially immediately) that this task could "starve" the rest of the system by not letting any other tasks have a chance. To understand this possibility, you should read more about microtasks (aka Jobs). Basically, if each step in a promise chain resolves immediately, each subsequent step is scheduled "right away", such that no other waiting asynchronous operations get to run.

Or what if you had ten sets of HTTP request/response cycles, but you need to make sure that no more than 3 of them were being processed at any given moment? Or perhaps you needed to not proceed ASAP but rather in a strictly round-robin order through the set of running tasks.

There's probably half a dozen other scenarios where naive scheduling of the progression of async operations is not sufficient. In all those cases, we'd like to have more control.

An async function affords no such control because the promise-resumption step is baked into the engine. But a smarter run(..) utility driving your generators could absolutely selectively decide which ones to resume in which order.

By the way, while I'm being general about such scenarios for brevity sake, this is not purely theoretical. An open area of my research in async programming is CSP, Communicating Sequential Processes, the model for concurrency used in the go language and also in ClojureScript's core.async.

Normally CSP processes are modeled in JS using generators, because you will in general have many of them running at the same time, and usually need fine grained control over which ones resume after others pause. Attempts have been made to model CSP using async functions, but I believe these systems are inherently flawed in that the library is susceptible to all the above limitations because it has no control over the scheduling.

CSP is one very concrete example of why it's important to have scheduling control over async operations. async functions just don't offer what we need, but generators do.

### async functions vs Generators
OK, so let's take stock of where we're at.
First we examined how async functions work and what makes them so nice from a syntactic sugar perspective. But now we've seen several places where the tradeoff is that we lose control of potentially very important aspects of our asynchrony.

You may consider these limitations unimportant because you haven't needed to do any of the fine-grained control described here. And that's fine. The async function will serve you just fine.
But... what pain are you really enduring if you stuck with generators? Again, a side-by-side comparison:

```
function *foo(x) {
  try {
    var y = yield getY( x );
    return x + y;
  }
  catch (err) {
    return x;
  }
}

run( foo( 3 ) )
.then( function(result){
  console.log( result );
} );
```
versus:

```
async function foo(x) {
  try {
    var y = await getY( x );
    return x + y;
  }
  catch (err) {
    return x;
  }
}

foo( 3 )
.then( function(result){
  console.log( result );
} );
```
They're almost identical.
In both versions you get localized synchronous semantics (including pause/resume and error handling), and you get a promise that represents the completion of the foo(..) task.

For generators, you do need the simple run(..) library utility, whereas with async functions, you don't. But as we discussed, such a utility is only about a dozen lines of code in its simplest form. So is it actually that burdensome?

For the extra control we get, I think run(..) is an easy price to justify.
finally { .. }

For the majority of my async code, I believe generators+promises is a better, more flexible, more powerful option, at only a minimal expense.

I'd rather not start with async functions and then later realize that there are places where I need more control, and have to refactor back to generators. That's especially true considering the complications of mixing the two forms that I addressed in part one.

async..await seems like a great feature. But it's too simplistic, IMO. The small syntactic benefits are not worth the loss of control.

