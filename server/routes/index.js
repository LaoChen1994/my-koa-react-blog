const router = require('koa-router')();
const apiRouter = require('./api/index');

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());

module.exports = router;
