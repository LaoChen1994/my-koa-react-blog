const Koa = require('koa');
const app = new Koa();
const json = require('koa-json');
const onerror = require('koa-onerror');
const logger = require('koa-logger');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const koajwt = require('koa-jwt');
const { genResp } = require('./utils');

const router = require('./routes/index');

// error handler
onerror(app);

// middlewares

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
      ctx.body = genResp(false, 'User Verify failed', {})
    } else {
      throw err;
    }
  });
});

app.use(
  koajwt({
    secret: 'my_token'
  }).unless({
    path: [/^\/api\/user/, /^\/images\//]
  })
);


app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 1024 * 1024 * 100
    },
    patchKoa: true
  })
);

app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(router.routes(), router.allowedMethods());

app.use(ctx => {
  ctx.session.refresh();
});

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

module.exports = app;
