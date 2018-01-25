---
layout: page
title: 心驰神往
nickname: 爱车
permalink: /car/
---

{% for category in site.categories %}
    {% if category.first == 'car' %}
        <ul class="arc-list">
            {% for post in category.last %}
            <li>
                {{ post.date | date:"%Y-%m-%d"}}
                <a href="{{ post.url }}">{{ post.title }}</a>
            </li>
            {% endfor %}
        </ul>
    {% endif %}
{% endfor %}
