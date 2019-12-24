### 踩坑指南

#### 1. useReducer的initialState无法被赋值给type never

~~~javascript
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

~~~

**解决方案：**

  在reducer的default的返回应该为state，而不是返回一个undefined


#### 2. koa2使用jwt完成用户登录持久化


##### 1. 方案

1. 登录完毕后，后端返回加密的token(利用jsonwebtoken进行加密)
2. 需要鉴权的接口，在请求的时候在request header中添加 Authorization
3. 后端根据解析header Authorization 并进行鉴权
4. 鉴权成功返回数据

#### 2. 所用到的库
  + koa2-cors
  + koa-jwt
  + jsonwebtoken

#### 3. 容易出现问题的原因

+ cors 和　jwt 中间件的使用顺序，先使用cors再使用jwt

~~~javascript

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
      ctx.body = 'User Verify failed'
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

~~~~

> Notes: 如果先设置koa-jwt接口直接因为跨域的问题，无法进到koa-jwt的鉴权中

+ 前端在请求头添加token的方法(利用Axios拦截器)

~~~javascript
Axios.interceptors.request.use(config => {
  const token = window.localStorage.getItem('userToken');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});
~~~

+ 前端通过拦截器捕获token过期不存在的异常情况

~~~javascript
Axios.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    if(error.response.status === 401) {
      window.location.href = "http://localhost:3000/#/login"
    }

    return error;
  }
);
~~~

+ 前端获取登录token并保存

~~~javascript
  const handleLogin = async () => {
    // 获取表单数据
    const { username, password } = form.getValue();
    const {data} = await userLogin(username, password);
    const { token } = data;
    window.localStorage.setItem('userToken', token);
    history.push('/home')
  };
~~~

#### 4. margin: auto 失效的解决办法

+ 元素的display设为block


#### 5. javascript Blob与字符串之间的转换

