---
layout: post
title: Liquid 操作记录
category: tech
excerpt:  Liquid 语法
tags: [jekyll, liquid]
---

```
for category in site.categories
    if category.first == 'travel'
        <ul class="arc-list">
            for post in category.last
            <li>
                post.date | date:"%Y-%m-%d"
                <a href="\{\{ post.url \}\}">{{ post.title }}</a>
            </li>
            endfor
        </ul>
    endif
endfor
```
