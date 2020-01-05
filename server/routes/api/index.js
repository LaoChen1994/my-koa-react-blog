const Router = require('koa-router');
const userApi = require('./users.js');
const todoApi = require('./todo.js');
const homeApi = require('./home.js');
const BlogApi = require('./blog.js');

const router = new Router()
  .use('/user', userApi.routes(), userApi.allowedMethods())
  .use('/todo', todoApi.routes(), todoApi.allowedMethods())
  .use('/home', homeApi.routes(), homeApi.allowedMethods())
  .use('/blog', BlogApi.routes(), BlogApi.allowedMethods());

module.exports = router;
