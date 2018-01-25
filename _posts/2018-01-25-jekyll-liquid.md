---
layout: post
title: Liquid 操作记录
category: tech
excerpt:  Liquid 语法
tags: [jekyll, liquid]
---

## 命令

启动服务
```
bundle exec jekyll serve // 启动服务
```
访问本地地址`http://localhost:4000`

## Liquid 语法
https://www.cnblogs.com/lslvxy/p/3651936.html

```
for category in site.categories
    if category.first == 'travel'
        <ul class="arc-list">
            for post in category.last
            <li>
                post.date | date:"%Y-%m-%d"
            </li>
            endfor
        </ul>
    endif
endfor
```
