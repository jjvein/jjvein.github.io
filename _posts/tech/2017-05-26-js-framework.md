---
layout: post
title: 前端框架
excerpt: Web前端框架细节记录
category: tech
---

# react
## React key
[React之key详解](https://segmentfault.com/a/1190000009149186)
- key属性的使用场景最多的还是由数组动态创建的子组件的情况
- key值是一个永久且唯一的值
- 数组非变动时, 可以使用 index 代替, 但不推荐
- react根据key决定销毁重新创建还是更新组件

> 不推荐写法
```
render() {
    return <ul>{ this.state.data.map((v, index) => <Item key={index} v={v} />) }</ul>
}

// Item 组件
render() {
    return <li>{ this.props.v }<input type="text" /></li>;
}
```

> 推荐写法
```
//this.state.users内容
this.state = {
 users: [{id:1,name: '张三'}, {id:2, name: '李四'}, {id: 2, name: "王五"}],
}

render()
  return (
      <div>
        <h3>用户列表</h3>
        {this.state.users.map(u => <div key={u.id}>{u.id}:{u.name}</div>)}
      </div>
  )
);
```

## JSX -> VirtualDOM
```
// 转换前
const element = (
    <div>
        <h3>用户列表</h3>
        {[<div key={1}>1: 周一</div>, <div key={2}>2: 周二</div>, <div key={3}>3: 周三</div>]}
    </div>
);
// 转换后
"use strict";
var element = React.createElement(
    "div",
    null,
    React.createElement("h3", null, "用户列表"),
    [
        React.createElement("div", { key: 1 }, "1: 周一"),
        React.createElement("div", { key: 2 }, "2: 周二"),
        React.createElement("div", { key: 3 }, "3: 周三")
    ]
);
```

# vue

# Angular