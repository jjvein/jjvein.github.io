---
layout: post
title: Implementing CSP
tags: [csp, security]
category: security
author: April King, Stuart Colville
---
## [Implementing Content Security Policy](https://hacks.mozilla.org/2016/02/implementing-content-security-policy/)

By April King, Stuart Colville

Posted on February 16, 2016

The add-ons team recently completed work to enable Content Security Policy (CSP) on addons.mozilla.org (AMO). This article is intended to cover the basics of implementing CSP, as well as highlighting some of the issues that we ran into implementing CSP on AMO.

Firefox的add-ons团队最近在addons.mozilla.org(AMO)完成了CSP的支持。这篇文章将介绍实现CSP的基础，同时强调一下在AMO上实现时遇到的一些问题。

### What is Content Security Policy?

Content Security Policy (CSP) is a security standard introduced to help prevent cross-site scripting (XSS) and other content injection attacks. It achieves this by restricting the sources of content loaded by the user agent to those only allowed by the site operator.

The policy is implemented via headers that are sent with the server response. From there, it’s up to supporting user agents to take that policy and actively block policy violations as they are detected.

Content Security Policy(CSP)是用来阻止XSS和其他注入攻击的安全协议。它通过用户代理的浏览器来限制只有指定资源才能被加载实现功能。

这个协议通过服务器返回Header控制，支持CSP的浏览器能够解析Header，并阻止它检测到的协议侵犯。

### Why is it needed?

CSP is another layer of defense to help protect users from a variety of attack vectors such as XSS and other forms of content injection attacks. While it’s not a silver bullet, it does help make it considerably more difficult for an attacker to inject content and exfiltrate data.

Building websites securely is difficult. Even if you know general web security best practices it’s still incredibly easy to overlook something or unwittingly introduce a security hole in an otherwise secure site.

CSP works by restricting the origins that active and passive content can be loaded from. It can additionally restrict certain aspects of active content such as the execution of inline JavaScript, and the use of eval().

CSP帮助用户遭受大量如XSS和其他形式内容注入攻击的另一层守护。虽然它不是“林丹妙药”，但它确实让攻击者注入内容，泄露内容更加困难。

建立一个安全的网站是很困难的。即使你知道通常的网络安全最佳实践，但还是不可避免的忽略一些其他完整暴露出的安全漏洞。

CSP通过只有同源的资源才能够被加载。它也可以限制inline Javascript，`eval()`方式的代码执行。

### Implementing CSP

To implement CSP, you must define lists of allowed origins for the all of the types of resources that your site utilizes. For example, if you have a simple site that needs to load scripts, stylesheets, and images hosted locally, as well as from the jQuery library from their CDN, you could go with:

使用CSP，你必须定义网站使用的各种资源。举例，你有一个简单的网站，它需要从相同域名下获取JS，样式文件以及图片，同时也需要从CDN上获取jQuery类库，那么可以这样写：

```
Content-Security-Policy:
    default-src 'self';
    script-src 'self' https://code.jquery.com;
```

In the example above, Content-Security-Policy is the HTTP header. You can also specify Content-Security-Policy-Report-Only, which means that the user agent will report errors but not actively block anything. While you’re testing a new policy, this is a useful feature to enable.

		For script-src, we have to also explicitly list 'self' because if you define a directive then it no longer inherits from default-src.
		
It’s very important to always define default-src. Otherwise, the directives will default to allowing all resources. Because we have default-src 'self', this means that images served from the site’s domain will also be allowed.

在上面的例子中，`Content-Security-Policy`是一个HTTP头。你也可以使用`Content-Security-Policy-Report-Only`，这表示用户浏览器只会报告错误而不会禁止代码执行。当你想测试一个新的规则时，这是一个非常有用的特性。

		对于`script-src`,我们指定了'self',因为当你定义一个指令时，它将不会再继承`default-src`。
		
始终定义`default-src`,这非常重要。否则，这些指令将允许所有的资源。因为我们使用`default-src 'self'`，这表示和网站相同域名的图片允许被加载。

default-src is a special directive that source directives will fall back to if they aren’t configured. However, the following directives don’t inherit from default-src, so be aware of this and remember that not setting them to anything means they will either be unset or use the browser’s default settings:

- base-uri
- form-action
- frame-ancestors
- plugin-types
- report-uri
- sandbox

Setting 'self' as default-src is generally safe, because you control your own domain. However if you really want to default to locking things down more tightly you could use default-src 'none' and explicitly list all known resource types. Given the example above, this would result in a policy that looks like:

`default-src`是一个特殊的指令，当`source`指令没有配置时，默认的会回退去寻找它。但是下面的指令并不会继承`default-src`,记住不设置它们表示要么是没设置状态，要么就是浏览器的默认设置：

- base-uri
- form-action
- frame-ancestors
- plugin-types
- report-uri
- sandbox

给`default-src`设置'self'是很安全的，因为你可以控制你自己的域名。如果你想更加严格的控制下载的资源，可以使用 `default-src 'none'`，然后显式的列出所有加载的资源类型。举例：

```
Content-Security-Policy:
    default-src 'none';
    img-src 'self';
    script-src 'self' https://code.jquery.com;
    style-src 'self';
```

		If you rely on prefetching, you might encounter problems with default-src 'none'. On AMO, we discovered that browser prefetching in Firefox will not be identified as a specific content type, therefore falling back to default-src. If default-src doesn’t cover the origin involved, the prefetched resource will be blocked. There’s a bug open with additional information on this issue.


如果你依赖`prefetching`预先加载，你可能会在使用`default-src 'none'`时遇到问题。在AMO，我们发现Firefox上预先加载没有办法识别指定的资源类型，因此它们会去寻找`default-src`的值。如果`default-src`并没有将本域名包括在内时，预先加载的资源将会被阻塞。

### Dealing with inline script

CSP by default doesn’t allow inline JavaScript unless you explicitly allow it. This means that you need to remove the following:

- `<script>` blocks in the page
- DOM event handlers in HTML e.g: onclick
- javascript: pseudo protocol.

If you do need to allow it then CSP provides a way to do it safely through the use of the nonce-source or hash-source directives, which allow specific blocks of content to be executed. You can opt out of this protection through the use of ‘unsafe-inline’ in the script-src directive, but this is strongly discouraged as it opens up your site to XSS attacks.

For additional information on nonce-source and hash-source, see CSP for the web we have.

CSP默认情况下是不支持内联JavaScript的，除非你显式的允许它。这就表示你需要移除下面的代码：

- 页面上的`<script>`代码块
- DOM事件处理函数。如: onclick
- `javascript:`伪协议

如果你希望允许它执行，那么CSP提供使用`nonce-source`或者`hash-source`来安全的执行它。你也可以通过在`script-src`指令中使用'unsafe-inline`来跳出CSP的保护。但我们强烈建议不要这样做，它能让你的网站直接暴露在XSS攻击。想要了解`nonce-source`和`hash-source`的内容，看[CSP for the web](https://blog.mozilla.org/security/2014/10/04/csp-for-the-web-we-have/).

### Dealing with eval()

CSP also blocks dynamic script execution such as:

- eval()
- A string used as the first argument to setTimeout / setInterval
- new Function() constructor

If you need this enabled you can use 'unsafe-eval' but again this is not recommended as it is easy for untrusted code to sneak into eval blocks.

On AMO, we found a lot of library code that used eval and new Function, and this was the part of CSP implementation that took the most time to fix. For example, we had underscore templates that used new Function. Fixing these required us to move to pre-compiled templates.

CSP也会阻止动态脚本的执行：

- eval()
- 使用字符串作为`setTimeout`/`setInterval`的第一个参数
- `new Function`的构造函数

如果你希望这能够得到允许，你可以使用'unsafe-eval'，但是还是不建议这样做，它很容易让不受信任的代码进入eval代码块。

在AMO，我们发现很多类库代码使用`eval`和`new Function`，使用CSP就必须花时间来修复。比如，我们的underscore模板中就使用`new Function`来实现。修复这个问题需要我们处理编译之前的模板。

### Dealing with cascading stylesheets (CSS)

CSP defaults to not allowing:

- `<style>` blocks
- style attributes in HTML


This was a bit more of a problem for us. Lots of libraries use style attributes in HTML snippets added to the page with JavaScript and we had a sprinkling of style attributes directly in HTML templates.

It’s worth mentioning that if style properties are updated via JavaScript directly, then you won’t have a problem. For example, jQuery’s css() method is fine because it updates style properties directly under the covers. However, you can’t use style="background: red" in a block of HTML added by JS.

This can be a bit confusing because in the Firefox inspector, style properties that have been added via JavaScript look identical to style attributes in HTML.

As before, you can use the nonce-source and hash-source directives if you need a controlled approach to allow select pieces of inline CSS.

You’re probably thinking, “This is CSS, what’s the risk?” There are various clever ways that CSS can be used to exfiltrate data from a site. For example, with attribute selectors and background images, you can brute force and exfiltrate attribute sensitive data such as CSRF tokens. For more information on this and other more advanced attack vectors through CSS see XSS (No, the _other ‘S’).

Using 'unsafe-inline' for style-src is not recommended, but it’s a case of balancing the risks against the number of changes that would be necessary to eliminate inline styles.

CSP默认不允许：

- `<style>`代码块
- HTML的样式属性

这的问题更多。很多类库使用JavaScript生成带有`style`属性的HTML片段到页面，同时我们自己的页面中也还有少量的`style`属性。

值得一提的是，如果你的样式直接通过JavaScript进行修改是允许的。例如，jQuery的`css()`方法直接更新页面的style属性。然而，你不可在HTML中使用`style="background: red"`来修改。

这一点是很让人疑惑的，因为Firefox中，使用JavaScript直接修改style属性和在HTML中添加一段样式基本上是一样的。

和以前一样， 你也可以使用`nonce-source`和`hash-source`指令来选择性的控制那些样式CSS允许被加载。

你可能在想，“这是CSS，能有什么风险呢？”事实上有很多取巧的方法能够让CSS来泄露网站的数据。例如：使用属性选择器和北京图片，你可以暴力破解，泄露类似于CSRF tokens这样的敏感数据。更多关于CSS攻击的内容，请参考[No, the _other 'S'](https://mikewest.org/2013/09/xss-no-the-other-s-cssconfeu-2013)


### Reporting

It’s a good idea to set the report-uri directive and point it somewhere to collect JSON reports of CSP violations. As CSP doesn’t currently coalesce error reports, a single page with multiple errors will result in multiple reports to your reporting endpoint. If you run a site with a large audience, that endpoint can receive a significant amount of traffic.

In addition to reports triggered by actual violations, you’ll also find that many add-ons and browser extensions can cause CSP violations. The net result is a lot of noise: Having something that allows for filtering on the incoming data is highly recommended.

设置`report-uri`指令可以收集CSP侵犯记录，然后报告给指定的URI。因为CSP目前还不支持合并错误报告，所有的侵犯记录都会输出给报告的终端用户。如果你的网站有大量的用户，这可能会需要很大的带宽来接收信息。

除了被实际的网络攻击侵犯以外，你会发现很多浏览器插件和拓展也会导致CSP侵犯。所以建议对进入的数据做一个过滤。

### Testing

Once you have created your initial policy, the next step is to test it and fix any missing origins. If you run a large site, you may be surprised by the number of sources that you are pulling resources from. Running the site with CSP in report-only mode allows you to catch problems via the console and CSP reports before they actively block things.

Once everyone has confirmed that there’s nothing being blocked erroneously, it’s time to enforce the policy. From there on, it’s just a case of watching out for anything that was missed and keeping the policy up to date with browser support for some of the newer features in CSP.

一旦你建立了基本的初始化规则以后，下一步就是测试并修复遗漏的域名。如果你的是一个很大的网站，你会被网站下载的各种资源吓到。使用CSP的报告模式能够通过console和CSP报告的方式告知问题。

### Implementing

After you have settled upon a policy that works properly, your next step is to configure your system to deliver the CSP directives. Implementing this varies widely depending on your choice of web server software, but it should generally look like this:

当你确定使用哪种合适的指令以后，下一步就是配置你的系统来完成CSP指令的分发工作。实现方案随着Web Server的不同也有所不同，但是通常和下面的类似： 

```
# Enable CSP in Apache
Header set Content-Security-Policy "default-src 'none'; img-src 'self';
    script-src 'self' https://code.jquery.com; style-src 'self'"
```
```
# Enable CSP in nginx
add_header Content-Security-Policy "default-src 'none'; img-src 'self';
    script-src 'self' https://code.jquery.com; style-src 'self'";
```

If your service provider doesn’t offer control over your web server’s configuration, don’t panic! You can still enable CSP through the use of meta tags. Simply have your meta tag be the first tag inside <head>:

如果你的服务提供商不允许修改server的配置，没关系！你仍然可以通过使用meta标签来使用CSP。让meta标签成为`<head>`的第一个标签：

```
<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self';
          script-src 'self' https://code.jquery.com; style-src 'self'">
</head>
```

### Our final implementation

Given that AMO is an older and extremely complex site, you’re probably curious as to what our final policy ended up looking like:

AMO是一个陈旧，且极其复杂的网站，你可能很好奇我们最终的规则是什么样的： 

```
Content-Security-Policy:
    default-src 'self';
    connect-src 'self' https://sentry.prod.mozaws.net;
    font-src 'self' https://addons.cdn.mozilla.net;
    frame-src 'self' https://ic.paypal.com https://paypal.com
        https://www.google.com/recaptcha/ https://www.paypal.com;
    img-src 'self' data: blob: https://www.paypal.com https://ssl.google-analytics.com
        https://addons.cdn.mozilla.net https://static.addons.mozilla.net
        https://ssl.gstatic.com/ https://sentry.prod.mozaws.net;
    media-src https://videos.cdn.mozilla.net;
    object-src 'none';
    script-src 'self' https://addons.mozilla.org
        https://www.paypalobjects.com https://apis.google.com
        https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/
        https://ssl.google-analytics.com https://addons.cdn.mozilla.net;
    style-src 'self' 'unsafe-inline' https://addons.cdn.mozilla.net;
    report-uri /__cspreport__
```

Wow! As you can imagine, quite a lot of testing went into discovering the myriad resources that AMO utilizes.

Wow！你可以想象，我们为了发现AMO加载的各种资源做了很多测试工作。

### In Summary

The older your site is, the more work it will take to set and adhere to a reasonable Content Security Policy. However, the time is worth spending as it’s an additional layer of security that supports the idea of defense in depth.

你的网站越老，所有做的工作也就越多。然而这些都是值得做的，因为它是在支持完整安全方面新添加的另外一层防护。

### Further Reading

[An Introduction to Content Security Policy, by Mike West](http://www.html5rocks.com/en/tutorials/security/content-security-policy/)

[Browser Support for CSP](http://caniuse.com/#search=Content%20Security%20Policy)

[Content Security Policy Level 2 Specification](http://www.w3.org/TR/CSP2/)

[MDN docs on CSP](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/CSP_policy_directives)
