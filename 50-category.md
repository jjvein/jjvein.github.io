---
layout: page
title: 分类
permalink: /category/
---
{% for category in site.categories %}
<h2>{{ category | first }}</h2>
<ul class="arc-list">
    {% for post in category.last %}
        <li><a href="{{ post.url }}">{{ post.title }}</a> {{ post.date | date:"%Y-%m-%d"}} </li>
    {% endfor %}
</ul>
{% endfor %}
