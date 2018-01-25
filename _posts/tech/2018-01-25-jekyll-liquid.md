---
layout: post
title: github page
category: tech
excerpt:  Liquid 语法
tags: [jekyll, liquid]
---

# 命令

启动服务

```
bundle exec jekyll serve // 启动服务
```

安装依赖

```
bundle install
```
访问本地地址`http://localhost:4000`

# Liquid 语法
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

# 目录插件
[目录插件](https://github.com/dafi/tocmd-generator)

```
    $('.post-content').toc({
      minItemsToShowToc: 2,
      contentsText: "目录",
      hideText: "隐藏",
      showText: "展开"
    });
```
> `.post-content`表示文档所在节点
