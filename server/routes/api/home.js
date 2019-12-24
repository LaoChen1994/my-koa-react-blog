const router = require('koa-router')()
const HomeController = require('../../controller/home.js');

router.get('/list', HomeController.getHomeLogin)

module.exports = router
