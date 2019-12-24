const Router = require('koa-router');
const userApi = require('./users.js');
const todoApi = require('./todo.js');
const homeApi = require('./home.js');

const router = new Router()
  .use('/user', userApi.routes(), userApi.allowedMethods())
  .use('/todo', todoApi.routes(), todoApi.allowedMethods())
  .use('/home', homeApi.routes(), homeApi.allowedMethods());

module.exports = router;
