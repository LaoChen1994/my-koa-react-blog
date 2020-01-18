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

#### 10 . React 图片或者文件上传问题

- 通过 base64 前端处理图片为 base64 的解决方案
  - 利用 FileReader 对数据进行读取，如果是图片会将图片读取为 base64 的形式
  - 将得到的 base64 的字符串传给后端
  - 后端直接保存该html字符串，之后调用接口查询该数据直接前端通过img标签完成自动解析即可

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

    reader.readAsDataURL(file); // 得到经过base64编码的图片信息
  };

  return (
    <div className="App">
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}
```

+ 利用input,xhr,formData来实现
  + 利用input[type='file']来实现
  + 点击选择文件，且选择文件完毕后，触发onChange事件
  + 通过event.targer.files(react中)获取所选文件
  + 通过FormData这个类，将文件添加到其实例中
  + 配置xhr，通过POST的方式发送formData到后端即可

~~~javascript
import React, { useState } from 'react';
import { ApiHost } from '../../constant';
import { Button, FormControl, Progress } from 'zent';

export type UploadCompletCallback<T> = (
  e: ProgressEvent<XMLHttpRequestEventTarget>,
  reponse: T
) => void;

export type UploadStartCallback = (
  e: ProgressEvent<XMLHttpRequestEventTarget>
) => void;

export type UploadProcessCallback = (loaded: number, total: number) => void;

interface Props {
  onComplete?: UploadCompletCallback<any>;
  onStart?: UploadStartCallback;
  onProcess?: UploadProcessCallback;
  hasProcess?: boolean;
  title: string;
}

export const UploadBtn: React.FC<Props> = props => {
  const { onComplete, onStart, onProcess, hasProcess = false, title } = props;
  const [progress, setProgress] = useState<number>(0);
  const [uploadStatus, setStatus] = useState<boolean>(false);

  // 处理文件上传的核心方法
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      if (!files.length) return;

      // 将文件处理成formData
      let formData = new FormData();
      for (let k in files) {
        formData.append('file', files[k], window.encodeURI(files[k].name));
      }

      let xhr = new XMLHttpRequest();

      xhr.responseType = 'json';
      xhr.timeout = 5000;
      xhr.open('POST', `${ApiHost}/user/upload`, true);

      // 事件监听
      xhr.addEventListener('loadstart', e => {
        setProgress(0);
        setStatus(true);
        onStart && onStart(e);
      });

      xhr.upload.onprogress = function(e) {
        const { total, loaded } = e;
        setProgress((loaded / total) * 100);
        onProcess && onProcess(loaded, total);
      };

      xhr.addEventListener('load', e => {
        const result = xhr.response;
        onComplete && onComplete(e, result);
      });

      xhr.send(formData);
    } else {
      return;
    }
  };

  const selectFile = () => {
    const btn = document.querySelector("input[type='file']");
    //@ts-ignore
    btn && btn.click();
  };
  return (
    <FormControl label={title}>
      <input type="file" onChange={handleChange} style={{ display: 'none' }} />
      <Button onClick={selectFile}>上传</Button>
      {hasProcess && uploadStatus && <Progress percent={progress}></Progress>}
    </FormControl>
  );
};



~~~

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

#### 12. nodejs mysql 库的几个使用问题解决

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

#### 13. 在react中使用防抖和节流

##### 1. 原理

为什么要使用防抖节流，以及防抖节流的原理可以细看

[防抖和节流](https://blog.csdn.net/qq_24724109/article/details/100661976)

##### 2. 在React中使用防抖节流错误的例子

~~~javascript
import React from "react";
import { debounce } from "lodash";

export function ErrorInput() {
  const onChange = e => {
    console.log(e.target.value);
  };

  return <input onChange={debounce(onChange, 500)} />;
}
~~~

*上述代码看上去没啥问题，但是我们实际在输入框中改变Input的值的时候会出现以下报错*
![](./img/选区_149.png)

这里存在的问题是，因为event事件是同步的，而通过debounce之后，会将多次的事件合并为一次，进行执行，因此该event性质会被改变不再是同步传过来的变量了，因此会有该警告

##### ３. 解决办法

方法一：添加e.persist()。如果按照提示，在调用的函数中添加e.persist(),确实能够消除该报错，但是接下来的问题是event.target可能会是null，那么如果我们在接下来的业务代码中需要使用到e.target.value就会由问题。因此这个方法不太推荐。

方法二：利用传参的方法来实现。直接上代码

```javascript
import _ from "lodash";
import React, { Component } from "react";

function Search() {
  const _handle = value => {
    console.log(value);
  };

  const debounceHandler = _.debounce(_handle, 500);

  const onChange = e => {
    debounceHandler(e.target.value);
  };

  return (
    <div>
      Search:
      <input onChange={onChange} />
    </div>
  );
}

export default Search;
```

**要点总结：**

1. 设置一个同步处理函数_handle，该函数接受传来的value值，下面就和普通的回调函数一样执行业务代码即可
2. 通过一个debounceHandler，调用bounce来生成一个防抖的回调函数
3. 定义一个绑定的onChange函数，并指定传参到debounceHandler中即可

**注意：**这个debonceHandler不能定义在onChange函数内！！！！！非常重要。因为lodash的debounce是通过闭包来维护一个内部的timer,来控制当指定时间段内，多次事件合并。如果定义在onChange内，每次都会多产生一个闭包环境，仍然会导致多个回调函数被触发，达不到防抖的效果，切忌切忌

##### ４. 结果展示

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200111120917697.gif)



上述代码请查看[codesandbox demo](https://codesandbox.io/s/weathered-http-gc6mn)



#### 14. React Hook: useContext + useReducer代替redux

##### 0. 背景

当组件嵌套很深，通过一直传参的方法来实现会非常麻烦，为了共享一些参数，一般可以通过Context来实现参数的托管，如果要对部分参数进行修改，可以通过redux或者mobx来做状态的集中管理。在有了React hooks之后，通过Context + useReducer完成Redux的功能，这里做一个简单的记录。

##### 1. react hook useContext

在没有useContext的时候，类组件调用Context需要三要素

+ CreateContext

+ Context.Provider
+ Context.Consumer

其简单的使用方法可参考[React Context的简单使用](https://blog.csdn.net/qq_24724109/article/details/96772620)



当有了useContext，在函数式组件中也可以调用Context了，并且useContext可以直接获得最近的指定的Context中传递的参数，相当于代替了Context.Consumer, 因此，这个时候的三要素转换为了

+ CreateContext
+ Context.Provider
+ useContext



##### 2. react hook useContext例子

###### 1. 简单例子效果

![](./img/Peek 2020-01-13 10-17.gif)

###### 2. SwitchHeader组件的封装

**方法一：使用Context传统的传参方式实现**

~~~typescript
import React, { createContext, useState } from "react";

//　SwitchHeader.tsx
interface Props {
  headerRender: () => JSX.Element;
}

export const SwitchHeader: React.FC<Props> = props => {
  const { headerRender, children } = props;
  const [isShow, setShow] = useState<boolean>(true);

  const showHeader = () => setShow(true);
  const hiddenHeader = () => setShow(false);

  return (
    <div>
      <div style={{ display: isShow ? "block" : "none" }}>{headerRender()}</div>
      {/* 
      // @ts-ignore */}
      {children({ showHeader, hiddenHeader })}
    </div>
  );
};

// App.tsx
function App() {
  const headerRender = () => (
    <h1>
      我这里是头组件：头头头
    </h1>
  );

  return (
    <SwitchHeader headerRender={headerRender}>
      {({ showHeader, hiddenHeader }) => (
        <>
        　我是子组件控制按钮：
          <button onClick={showHeader}>show</button>
          <button onClick={hiddenHeader}>hidden</button>
        </>
      )}
    </SwitchHeader>
  );
}
~~~

*关键步骤：*将children作为一个函数，然后通过children向子组件传参,之后通过该SwitchHeader包裹的子组件可以通过showHeader和hiddenHeader来控制header的消失与否

**方法二：**利用Context的方法来实现

~~~typescript
// SwichHeader.tsx
import React, { createContext, useState } from "react";

interface Props {
  headerRender: () => JSX.Element;
}

export interface IHeaderControl {
  showHeader: () => void;
  hiddenHeader: () => void;
}

export const HeaderControl = createContext<IHeaderControl>({
  showHeader: () => {},
  hiddenHeader: () => {}
});

export const SwitchHeader: React.FC<Props> = props => {
  const { headerRender, children } = props;
  const [isShow, setShow] = useState<boolean>(true);

  const showHeader = () => setShow(true);
  const hiddenHeader = () => setShow(false);

  return (
    <HeaderControl.Provider
      value={{
        showHeader,
        hiddenHeader
      }}
    >
      <div style={{ display: isShow ? "block" : "none" }}>{headerRender()}</div>
      {children}
    </HeaderControl.Provider>
  );
};

// App.tsx
import * as React from "react";
import { render } from "react-dom";
import { SwitchHeader, HeaderControl } from "./useHeader";

import "./styles.css";

function Index() {
  const { useContext } = React;
  const { showHeader, hiddenHeader } = useContext(HeaderControl);

  return (
    <>
      <button onClick={showHeader}>show</button>
      <button onClick={hiddenHeader}>hidden</button>
    </>
  );
}

function App() {
  const headerRender = () => <h1>我这里是头组件：头头头</h1>;

  return (
    <SwitchHeader headerRender={headerRender}>
      <Index />
    </SwitchHeader>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);

~~~

***使用Context的几个点***

+ 当使用useContext的时候需要传入对应的Context的值，且获取的这个Context应该是最近的一个Provider给的
+ 在使用typescript的时候需要给CreateContext一个初始值
+ 使用CreateContext的步骤和类组件类似

##### 3. useReducer+Context

上面已经实现了将状态通过父组件进行托管，但是我们通过仅通过useState可能无法完成复杂的状态操作，因此通过useReducer来完成状态的复杂操作。

**对useReducer的理解**：useReducer其实和useState一样都是异步来重置某一个元素的状态的，但是useState通常只是修改某一个值，如果修改值之后需要进行回调操作可以通过useState+useEffect来实现，但是useReducer其本身内部可以接受外部参数然后做一些业务操作之后再修改值。

因此利用这个原理，我们将**Context中的value传递的的为state和dispatch**，来实现在useReducer中对状态的统一处理

###### 0.一个简单计数器的效果

![](./img/Peek 2020-01-13 11-29.gif)



###### 1. 代码实现

+ useReducer的使用

  + 定义reducer
  + 定义初始值
  + 使用useReducer获取state,和dispatch

+ 注意点

  + 在定义reducer的时候传入state的类型和最后操作完返回的state的类型一定要一致，不然typescript会报错,例如下面这个，说返回的类型是never

  ![](./img/选区_150.png)

~~~typescript
const initCounter: IState = { count: 0 };

const reducer = (state: IState, action: IAction) => {
  const { type, payload } = action;
  const { count } = state;
  switch (type) {
    case "add":
      return { count: payload ? payload + count : count + 1 };
    case "decrease":
      return { count: count - 1 };
    default:
      return null;
  }
};

function Test() {
  	const [state, dispatch] = useReducer(reducer, initCounter);
	// 业务代码通过state得到保存的状态，利用dispatch来控制
}
~~~



+ 获得了state和dispatch之后就通过Context传给子组件即可

~~~typescript
export const HeaderControl = createContext<IHeaderControl>({
  showHeader: () => {},
  hiddenHeader: () => {},
  state: initCounter,
  dispatch: value => {}
});

export const SwitchHeader: React.FC<Props> = props => {
  const { headerRender, children } = props;
  const [isShow, setShow] = useState<boolean>(true);

  const showHeader = () => setShow(true);
  const hiddenHeader = () => setShow(false);

  const [state, dispatch] = useReducer(reducer, initCounter);

  return (
    <HeaderControl.Provider
      value={{
        showHeader,
        hiddenHeader,
        state,
        dispatch
      }}
    >
      {state.count}
      <div style={{ display: isShow ? "block" : "none" }}>{headerRender()}</div>
      {children}
    </HeaderControl.Provider>
  );
};
~~~



+ 在子组件中调用的过程
  + 直接通过useContext，获取响应的state和dispatch即可

~~~typescript
import * as React from "react";
import { render } from "react-dom";
import { SwitchHeader, HeaderControl } from "./useHeader";

import "./styles.css";

function Index() {
  const { useContext, useState } = React;
  // 直接通过useContext调用即可
  const { showHeader, hiddenHeader, dispatch } = useContext(HeaderControl);
  const [value, setValue] = useState<number>(1);
  return (
    <>
      <input
        type="number"
        value={value}
        onChange={e => setValue(+e.target.value)}
      />
      <button onClick={showHeader}>show</button>
      <button onClick={hiddenHeader}>hidden</button>
      <button onClick={() => dispatch({ type: "add", payload: value })}>
        add
      </button>
      <button onClick={() => dispatch({ type: "decrease" })}>decrease</button>
    </>
  );
}

function App() {
  const headerRender = () => <h1>我这里是头组件：头头头</h1>;

  return (
    <SwitchHeader headerRender={headerRender}>
      <Index />
    </SwitchHeader>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);

~~~

#### 15.  React异步载入组件封装

##### 1. 场景叙述

今天，碰到这样一个问题，就是当表单重载修改的时候，需要根据接口返回的数据来实现表单的初始化，如果是自己封装的受控组件的话，其实很简单，直接通过value赋值，然后通过onChange做后续的改变就好了。我使用的是Zent组件库，在实际操作的时候发现这么一个问题，就是封装好的组件库中的defaultValue，他只能将第一次传入的值作为初始值，当通过异步请求得到defaultValue再改变其值的话，无法得到相应改变!

##### 2. 场景模拟

好吧，说了这么多可能没了解我的意思，我们来模拟一下这个场景

~~~react
// 先假设定义一个表单(抄的Zent的官网的例子)
function Component(props) {
  const { defaultValue } = props;
  const form = Form.useForm(FormStrategy.View);
  return (
    <Form layout="horizontal" form={form}>
      <FormInputField
        name="name"
        label={
          <span>
            用户名&nbsp;
            <Pop trigger="hover" content="用户名用于个人账号登录" centerArrow>
              <Icon type="error-circle-o" />
            </Pop>
            :
          </span>
        }
        defaultValue={defaultValue || "123"}
        validators={[
          Validators.minLength(5, "用户名至少 5 个字"),
          Validators.maxLength(25, "用户名最多 25 个字")
        ]}
        helpDesc="用户名为5-25个字"
        required="必填"
      />
      <FormInputField
        name="password"
        type="password"
        label="密码:"
        helpDesc={
          <span>
            密码由英文字母、数字组成
            <a href="https://youzan.com" target="_blank">
              查看更多
            </a>
          </span>
        }
        validateOccasion={
          Form.ValidateOccasion.Blur | Form.ValidateOccasion.Change
        }
        validators={[
          Validators.pattern(/^[a-zA-Z0-9]+$/, "只允许英文字母和数字")
        ]}
        notice="重要提示：填写后无法修改，请谨慎设置"
        required="必填"
      />
      <FormInputField
        className="demo-form-basic-email"
        label="E-Mail:"
        name="email"
        validators={[
          Validators.required("必填"),
          Validators.email("请输入正确的邮箱")
        ]}
      />
    </Form>
  );
}
~~~

我想定义对用户名进行异步初始值的定义，用setTimeout模拟一个调用接口的过程 

~~~react
export default function App() {
  const [defaultValue, setValue] = useState("");
  const _getValue = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve("Init123"), 500);
    });
  };

  const loadFunc = value => () => <Component defaultValue={value} />;

    useEffect(() => {

    const getValue = async () => {
      const data = await _getValue()
      console.log(data);
      setValue(data);
    }

    getValue()    

  }, [])

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <Component defaultValue={defaultValue} />
    </div>
  );
}
~~~

上述代码理论上随着defaultValue变为Init123，应该用户名的默认值会变为Init123, 然而其默认值还是123

![](/home/czx/Desktop/Learn/my-koa-react-blog/img/Selection_008.png)

##### 3. 原因分析

主要原因是***FormInputField只在组件加载的时候将该value设置为defaultValue，因此当后续改变defaultValue并不会改变该input的value值***。要解决该问题有两个方法。

+ 检测当default变化时才加载组件(类似组件的懒加载)

~~~react
export default function App() {

  const [defaultValue, setValue] = useState("");

  useEffect(() => {

    const getValue = async () => {
      const data = await _getValue()
      console.log(data);
      setValue(data);
    }

    getValue()    

  }, [])

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>javascript
      {
        defaultValue && <Component defaultValue={defaultValue} />
      }
    </div>
  );
}
~~~

这种方法确实可以解决这个问题，但是这种方法看上去不太优雅和通用，如果我们每次都需要判断一个值的存在与否来加载组件，有一些不方便，因此我们可以封装一个异步加载的组件，来完成这个工作。

+ 定义一个异步加载组件

~~~react
class AsyncComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Component: null
    };
  }

  async componentDidMount() {
    const { asyncFunc, loadFunc } = this.props;

    const data = await asyncFunc();
    this.setState({
      Component: loadFunc(data)
    });
  }

  render() {
    const { Component: MyList } = this.state;

    return <div>{MyList && <MyList />}</div>;
  }
}
~~~

+ 使用该组件的方法

~~~react
export default function App() {

  const _getValue = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve("Init123"), 500);
    });
  };

  const loadFunc = value => () => <Component defaultValue={value} />;


  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <AsyncComponent asyncFunc={_getValue} loadFunc={loadFunc} />
    </div>
  );
}
~~~

![](./img/Selection_009.png)