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

// css 这里导入一个@font-face

```css
@font-face {
  font-family: betty;
  src: url('../font/bellada\ personal\ license.ttf');
}

.header {
  font-family: 'betty';
}
```

上面的步骤操作完可能还没有能拿到字体，简单粗暴的解决办法

```html
<div className="header">
  <canvas width="600" height="300" id="plot"></canvas>
</div>
```

这样即可导入外部字体

#### 8. 优雅的处理 async/await 中的异常

```javascript
// 模拟一个Promise的事件

const getRandom = () =>
  new Promise((resolve, reject) => {
    const num = Math.random() * 5;
    if (num < 0.5) {
      resolve({ status: true, data: num });
    } else {
      reject({ status: false });
    }
  });

const to = promise =>
  promise
    .then(data => {
      console.log('success', data);
      return [null, data];
    })
    .catch(err => {
      console.log('faild', err);
      return [err];
    });

async function catchError() {
  const [err, data] = await to(getRandom());
  // 只需要判断err是否为null即可判断该异步程序执行是否有报错
  console.log(err, data);
}

catchError();
```

#### 9. React Hooks 中 useRef, useImperativeHandle, forwardRef 的使用方法

##### 1. 三者用处

1. useRef: 用于获取元素的原生 DOM 或者获取自定义组件所暴露出来的 ref 方法(父组件可以通过 ref 获取子组件，并调用相对应子组件中的方法)
2. useImperativeHandle:在函数式组件中，用于定义暴露给父组件的 ref 方法。
3. React.forwardRef: 将 ref 父类的 ref 作为参数传入函数式组件中，本身 props 只带有 children 这个参数，这样可以让子类转发父类的 ref,当父类把 ref 挂在到子组件上时，子组件外部通过 forwrardRef 包裹，可以直接将父组件创建的 ref 挂在到子组件的某个 dom 元素上

##### 2. 一个 React.forwardRef 的例子

```javascript
function InputWithLabel(props) {
  // 这里的myRef为通过外部打入的父级ref节点
  const { label, myRef } = props;
  const [value, setValue] = useState('');
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
      <RefInput label={'姓名'} ref={myRef} />
      <button onClick={handleFocus}>focus</button>
    </div>
  );
}
```

**结果**

![](./img/Peek 2020-01-03 09-51.gif)

结果分析：<font color=red>**通过 focus 直接子元素中 input 的 DOM 节点**</font>

##### 3. 存在问题

这样我们的 Ref 获得的是整个节点，但是有时候我们通过 ref 只需要暴露一部分参数就行了，为了解决这个问题，我们就需要用到 useImperativeHandle 来指定放出一部分我们需要的方法或者属性给父级

##### 4. 使用 forwardRef 和 useImperativeHandle 的方案

- 思路：
  - 子组件内部自建一个\_innerRef 来获取 ref 元素
  - 将通过 forwarfRef 传入的 ref 元素通过 useImperativeHandle 来进行绑定，指定该子组件对外暴露的方法或属性
  - 通过\_innerRef 调用响应的方法然后同时在 useImperativeHandle 中写代码即可，这样可以只暴露一部分方法属性，而不是整个底层的 input 原生 DOM 节点

```javascript
function InputWithLabel(props) {
  const { label, myRef } = props;
  const [value, setValue] = useState('');
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
```

##### 5. 结果

![](./img/Peek 2020-01-03 10-07.gif)

结果分析：<font color=red>**通过 focus 只能获取我们指定向外暴露那部分的方法**</font>

##### 6. 完整代码

```javascript
import React, { useRef, useState, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';

import './styles.css';

function InputWithLabel(props) {
  const { label, myRef } = props;
  const [value, setValue] = useState('');
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
      <RefInput label={'姓名'} ref={myRef} />
      <button onClick={handleFocus}>focus</button>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
```

#### 10 . React 图片上传问题

- 通过 base64 前端处理图片为 base64 的解决方案
  - 利用 FileReader 对数据进行读取，如果是图片会将图片读取为 base64 的形式
  - 将得到的 base64 的字符串传给后端
  - 后端解析 base64 的字符串为图片即可

[参考博文](https://blog.csdn.net/dreamer2020/article/details/51794450)

- 代码实现

```javascript
function App() {
  const handleFileChange = e => {
    const file = e.currentTarget.files[0];
    const reader = new FileReader();

    reader.onload = function() {
      // reader.results当完成onload后会将图片转为base64
      // 后端只要解析base64对应的字符串即可
      const result = this.result;
      console.log(result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="App">
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}
```

#### 11. zent 封装表单组件

##### 1. 利用 zent 的几个组件

- FormControl: 包裹封装组件，用于为封装的表单组件提供 label, invalid 等参数，与其他封装的表单组件统一格式
- FieldSet: 包裹封装的外部组件，当 FormStrategy.View 时，为上级托管的 Form 组件添加字段 name
- Form.useField: 初始化一个 model，包括初始值，键值 key 和值 value。这个 model 中值的改变将会注册到上级的 Form 中
- FieldUtils 中的几个方法:
  - useMAppend: 按照顺序从上往下执行回调函数
  - usePipe: 按顺序执行函数，且上一个函数的返回值将作为下一个函数的输出
  - makeChangeHandler: 指定一个需要改变 model 的值，注意:源码里这个是一个闭包函数，通过上级传入的 value 直接改传入 model 中对应的值

##### 2. 结合官网例子分析

```javascript
import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';

import {
  Form,
  Select,
  NumberInput,
  FormStrategy,
  FormControl,
  Button,
  FieldSet,
  Validators,
  FieldUtils
} from 'zent';

import 'zent/css/index.css';

const { SelectTrigger } = Select;
const countyCodeList = [
  {
    code: '+86',
    zh: 'zhongguo',
    eng: 'china',
    value: '中国 +86',
    index: 0
  },
  {
    code: '+853',
    zh: 'aomen',
    eng: 'Macau',
    value: '中国澳门 +853',
    index: 1
  }
];

const filterHandler = (item, keyword) => {
  return (
    keyword &&
    item.text
      .trim()
      .toLowerCase()
      .indexOf(keyword.trim().toLowerCase()) > -1
  );
};

function getValue(e) {
  return e.target.value;
}

const ContactPhone = () => {
  const select = Form.useField('areacode', 0);
  const input = Form.useField('mobile', '', [
    Validators.pattern(/^\d{1,10}$/, '请输入正确的手机号')
  ]);
  // 这个counter并没有挂载在任何表单元素上，直接通过fieldUtils进行修改
  const counter = Form.useField('counter', 0);
  const onSelectChange = FieldUtils.useMAppend(
    useCallback(() => (select.isTouched = true), [select]),
    FieldUtils.usePipe(getValue, FieldUtils.makeChangeHandler(select))
  );

  const [countNumber, setCounter] = useState(0);

  const handleChange = FieldUtils.useMAppend(
    FieldUtils.usePipe(e => {
      // 这里直接返回counterNumber + 1作为makeChangeHandler的输入值
      setCounter(countNumber + 1);
      return countNumber + 1;
      // 这里指定修改的对象model为counter,之后counter就会发生改变
    }, FieldUtils.makeChangeHandler(counter)),
    // 这里直接这样操作的原因是，因为本身NumberInput的回调函数就会传入value，所以直接将value传给makeChangeHandler的回调函数
    FieldUtils.makeChangeHandler(input, Form.ValidateOption.Default)
  );

  return (
    <FormControl
      className="form-demo-multiple-value"
      label="联系方式:"
      invalid={!!select.error || !!input.error}
    >
      <Select
        className="areacode"
        data={countyCodeList}
        filter={filterHandler}
        optionValue="index"
        optionText="value"
        trigger={SelectTrigger}
        width={160}
        value={select.value}
        onChange={onSelectChange}
      />
      <NumberInput
        className="phone-num"
        placeholder="请填写手机号"
        width={160}
        value={input.value}
        {...FieldUtils.useCompositionHandler(input)}
        onChange={handleChange}
        onBlur={useCallback(() => {
          input.isTouched = true;
          input.validate();
        }, [input])}
      />
      <Form.CombineErrors models={[select, input]} />
    </FormControl>
  );
};

const App = () => {
  const form = Form.useForm(FormStrategy.View);
  const getFormValues = useCallback(() => {
    const values = form.getValue();
    console.log(values);
  }, [form]);
  const resetForm = useCallback(() => {
    form.resetValue();
  }, [form]);
  return (
    <Form form={form} layout="horizontal">
      <FieldSet name="contactPhone">
        <ContactPhone />
      </FieldSet>
      <div className="zent-form__form-actions">
        <Button type="primary" onClick={getFormValues}>
          获取表单值
        </Button>{' '}
        <Button type="primary" outline onClick={resetForm}>
          重置表单值
        </Button>
      </div>
    </Form>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
```

#### 11. nodejs mysql 库的几个使用问题解决

**1. 查询插入数据的信息**

通过 query 的回调函数的第二个参数

```javascript

OkPacket {
  fieldCount: 0,
  affectedRows: 1, // 所影响几条数据
  insertId: 1, // 插入的insertId key primary
  serverStatus: 2,
  warningCount: 0,
  message: '',
  protocol41: true,
  changedRows: 0 }

```

通过读取该条信息可以获得插入数据的响应信息，特别是在**批量插入**的时候，可以直接获得响应的主键值，后序继续进行操作

##### 1. 一个例子

```javascript
const oldTagExec = query(oldTagUpdateSql);
const newTagExec = query(addNewTagsSql);

const [err, data] = await to(Promise.all([oldTagExec, newTagExec]));

if (!err) {
  const newTagRes = data[1];
  const { affectedRows, insertId } = newTagRes;

  const tagList = setBlogTags(
    [
      // 获得插入新tag的主键值
      ...oldTags.map(elem => elem.tagId),
      ...Array.from({ length: affectedRows }).map(
        (elem, index) => index + insertId
      )
    ].sort((x, y) => x - y)
  );
}
```
