# React+Koa+Mysql 实现个人博客功能

### 写在前面

菜鸟用来练手的小项目，各位大佬如果有看不下去的代码记得指点一下啊谢谢

不定时更新

### 技术栈

#### 1. 后端 Koa+Mysql

- 所用中间件
  - koa-static
  - ioredis
  - koa-session2
  - koa2-cors
  - koa-router
  - koa-jwt

#### 前端使用框架 React+Hooks+Typescript

- 组件库: Zent

## 下面为开发过程中碰到的问题小结

### 踩坑指南

#### 1. useReducer 的 initialState 无法被赋值给 type never

```javascript
const reducer = (state: IUserState, action: UserAction) => {
  switch (action.type) {
    case 'login':
      return { ...state, ...action.payload };

    case 'logout':
      return { ...state, ...initUserInfo };

    default:
      return;
  }
};

export const UserProvider: React.FC<{}> = props => {
  const { children } = props;

  // typescript 报错　Argument of type '{ username: string; userId: string; isLogin: boolean; }' is not assignable to parameter of type 'never'.ts(2345)
  const [state, dispatch] = useReducer(reducer, initUserInfo);

  return (
    <>
      <UserContext.Provider value={{ state, dispatch }}>
        {children}
      </UserContext.Provider>
    </>
  );
};
```

**解决方案：**

在 reducer 的 default 的返回应该为 state，而不是返回一个 undefined

#### 2. koa2 使用 jwt 完成用户登录持久化

##### 1. 方案

1. 登录完毕后，后端返回加密的 token(利用 jsonwebtoken 进行加密)
2. 需要鉴权的接口，在请求的时候在 request header 中添加 Authorization
3. 后端根据解析 header Authorization 并进行鉴权
4. 鉴权成功返回数据

#### 2. 所用到的库

- koa2-cors
- koa-jwt
- jsonwebtoken

#### 3. 容易出现问题的原因

- cors 和　 jwt 中间件的使用顺序，先使用 cors 再使用 jwt

```javascript
app.use(
  cors({
    origin: ctx => 'http://localhost:3000',
    maxAge: 1000,
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Set-Cookie']
  })
);

app.use((ctx, next) => {
  return next().catch(err => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = 'User Verify failed';
    } else {
      throw err;
    }
  });
});

app.use(
  koajwt({
    secret: 'my_token'
  }).unless({
    path: [/\/api\/user\/.*/]
  })
);
```

> Notes: 如果先设置 koa-jwt 接口直接因为跨域的问题，无法进到 koa-jwt 的鉴权中

- 前端在请求头添加 token 的方法(利用 Axios 拦截器)

```javascript
Axios.interceptors.request.use(config => {
  const token = window.localStorage.getItem('userToken');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});
```

- 前端通过拦截器捕获 token 过期不存在的异常情况

```javascript
Axios.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    if (error.response.status === 401) {
      window.location.href = 'http://localhost:3000/#/login';
    }

    return error;
  }
);
```

- 前端获取登录 token 并保存

```javascript
const handleLogin = async () => {
  // 获取表单数据
  const { username, password } = form.getValue();
  const { data } = await userLogin(username, password);
  const { token } = data;
  window.localStorage.setItem('userToken', token);
  history.push('/home');
};
```

#### 4. margin: auto 失效的解决办法

- 元素的 display 设为 block

#### 5. javascript Blob 与字符串之间的转换

使用 iconv-lite 库中的 decode 方法

```javascript
const iconv = require('iconv-lite');
// 这里的todoItem是一个blob对象 type: text
elem.todoItem = iconv.decode(elem.todoItem, 'UTF-8');
```

#### 6. mysql 插入 datetime 数据类型格式不对的解决办法

```javascript
// 这里的startTime是前端传过来经过Date.IOString转化的字符串
// 先通过new Date转换为JS的Date对象
// 之后通过moment库转换数据格式
const _startTime = moment(new Date(startTime)).format('YYYY-MM-DD HH:mm:ss');
const _endTime = moment(new Date(endTime)).format('YYYY-MM-DD HH:mm:ss');
```

#### 7. 在 canvas 中添加外部字体写 text 的方法

```javascript
// 这里创建一个link导入本地的@font-face
const link = document.createElement('link') as HTMLLinkElement;
link.rel = "stylesheet";
link.type = "text/css";
link.href = "../../static/style/mixins.css";

document.getElementsByTagName('head')[0].appendChild(link);

var image = new Image;
image.src = link.href;
image.onerror = function() {
  ctx.font = "100px betty";
  ctx.textAlign = "center";
  ctx.strokeText('Blog', 0, 0);
}
```

// css这里导入一个@font-face
~~~css
@font-face {
  font-family: betty;
  src: url('../font/bellada\ personal\ license.ttf');
}

.header {
  font-family: 'betty';
}
~~~

上面的步骤操作完可能还没有能拿到字体，简单粗暴的解决办法

~~~html

<div className="header">
  <canvas width="600" height="300" id="plot"></canvas>
</div>

~~~

这样即可导入外部字体


#### 8. 优雅的处理async/await中的异常

~~~javascript

// 模拟一个Promise的事件

const getRandom = () => new Promise((resolve, reject) => {
  const num = Math.random() * 5;
  if(num < 0.5) {
    resolve({status: true, data: num});
  } else {
    reject({status: false})
  }
})

const to = promise => promise.then(data => {
  console.log('success', data)
  return [null, data]
}).catch(err => {
  console.log('faild', err)
  return [err]
})

async function catchError() {
  const [err, data] = await to(getRandom());
  // 只需要判断err是否为null即可判断该异步程序执行是否有报错
  console.log(err, data);
}

catchError()

~~~

#### 9. React Hooks中useRef, useImperativeHandle, forwardRef的使用方法

##### 1. 三者用处

1. useRef: 用于获取元素的原生DOM或者获取自定义组件所暴露出来的ref方法(父组件可以通过ref获取子组件，并调用相对应子组件中的方法)
2. useImperativeHandle:在函数式组件中，用于定义暴露给父组件的ref方法。
3. React.forwardRef: 将ref父类的ref作为参数传入函数式组件中，本身props只带有children这个参数，这样可以让子类转发父类的ref,当父类把ref挂在到子组件上时，子组件外部通过forwrardRef包裹，可以直接将父组件创建的ref挂在到子组件的某个dom元素上

##### 2. 一个React.forwardRef的例子

~~~javascript
function InputWithLabel(props) {
  // 这里的myRef为通过外部打入的父级ref节点
  const { label, myRef } = props;
  const [value, setValue] = useState("");
  const handleChange = e => {
    const value = e.target.value;
    setValue(value);
  };

  return (
    <div>
      <span>{label}:</span>
      <input type="text" ref={myRef} value={value} onChange={handleChange} />
    </div>
  );
}

// 这里用forwardRef来承接得到父级传入的ref节点，并将其以参数的形式传给字节点
const RefInput = React.forwardRef((props, ref) => (
  <InputWithLabel {...props} myRef={ref} />
));

// 调用该RefInput的过程
function App() {
  // 通过useRef hook 获得相应的ref节点
  const myRef = useRef(null);

  const handleFocus = () => {
    const node = myRef.current;
    console.log(node);
    node.focus();
  };

  return (
    <div className="App">
      <RefInput label={"姓名"} ref={myRef} />
      <button onClick={handleFocus}>focus</button>
    </div>
  );
}
~~~

**结果**

![](./img/Peek 2020-01-03 09-51.gif)

结果分析：<font color=red>**通过focus直接子元素中input的DOM节点**</font>

##### 3. 存在问题

这样我们的Ref获得的是整个节点，但是有时候我们通过ref只需要暴露一部分参数就行了，为了解决这个问题，我们就需要用到useImperativeHandle来指定放出一部分我们需要的方法或者属性给父级

##### 4. 使用forwardRef和useImperativeHandle的方案

+ 思路：
  + 子组件内部自建一个_innerRef来获取ref元素
  + 将通过forwarfRef传入的ref元素通过useImperativeHandle来进行绑定，指定该子组件对外暴露的方法或属性
  + 通过_innerRef调用响应的方法然后同时在useImperativeHandle中写代码即可，这样可以只暴露一部分方法属性，而不是整个底层的input原生DOM节点

~~~javascript
function InputWithLabel(props) {
  const { label, myRef } = props;
  const [value, setValue] = useState("");
  const _innerRef = useRef(null);
  const handleChange = e => {
    const value = e.target.value;
    setValue(value);
  };

  const getValue = () => {
    return value;
  };

  useImperativeHandle(myRef, () => ({
    getValue,
    focus() {
      const node = _innerRef.current;
      node.focus();
    }
  }));

  return (
    <div>
      <span>{label}:</span>
      <input
        type="text"
        ref={_innerRef}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
~~~

##### 5. 结果

![](./img/Peek 2020-01-03 10-07.gif)



结果分析：<font color=red>**通过focus只能获取我们指定向外暴露那部分的方法**</font>



##### 6. 完整代码

~~~javascript
import React, { useRef, useState, useImperativeHandle } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

function InputWithLabel(props) {
  const { label, myRef } = props;
  const [value, setValue] = useState("");
  const _innerRef = useRef(null);
  const handleChange = e => {
    const value = e.target.value;
    setValue(value);
  };

  const getValue = () => {
    return value;
  };

  useImperativeHandle(myRef, () => ({
    getValue,
    focus() {
      const node = _innerRef.current;
      node.focus();
    }
  }));

  return (
    <div>
      <span>{label}:</span>
      <input
        type="text"
        ref={_innerRef}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

const RefInput = React.forwardRef((props, ref) => (
  <InputWithLabel {...props} myRef={ref} />
));

function App() {
  const myRef = useRef(null);

  const handleFocus = () => {
    const node = myRef.current;
    console.log(node);
    node.focus();
  };

  return (
    <div className="App">
      <RefInput label={"姓名"} ref={myRef} />
      <button onClick={handleFocus}>focus</button>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
~~~



##### 