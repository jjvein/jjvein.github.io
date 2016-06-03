---
layout: page
title: 标签
permalink: /tag/
---
{% comment %}
=======================
The following part extracts all the tags from your posts and sort tags, so that you do not need to manually collect your tags to a place.
=======================
{% endcomment %}
{% assign rawtags = "" %}
{% for post in site.posts %}
  {% assign ttags = post.tags | join:'|' | append:'|' %}
  {% assign rawtags = rawtags | append:ttags %}
{% endfor %}
{% assign rawtags = rawtags | split:'|' | sort %}

{% comment %}
=======================
The following part removes dulpicated tags and invalid tags like blank tag.
=======================
{% endcomment %}
{% assign tags = "" %}
{% for tag in rawtags %}
  {% if tag != "" %}
    {% if tags == "" %}
      {% assign tags = tag | split:'|' %}
    {% endif %}
    {% unless tags contains tag %}
      {% assign tags = tags | join:'|' | append:'|' | append:tag | split:'|' %}
    {% endunless %}
  {% endif %}
{% endfor %}

<div >
  <h3>TAGS</h3>
  {% for tag in tags %}
    <a href="{{ tag | slugify }}" class="a-tag"><i class="fa fa-tag"></i>{{ tag }}</a>
  {% endfor %}
</div>

{% for tag in site.tags %}
  <h3>{{ tag | first }}</h3>
  <ul>
    {% for post in tag.last %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul> 
{% endfor %}
