const router = require('koa-router')();
const HomeController = require('../../controller/home.js');

router.get('/list', HomeController.getHomeLogin);
router.get('/getNewBlogList', HomeController.getBlogList);
router.get('/getUndoList', HomeController.getUndoList);

module.exports = router;
