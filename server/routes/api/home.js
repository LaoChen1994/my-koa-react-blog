const router = require('koa-router')();
const HomeController = require('../../controller/home.js');

router.get('/list', HomeController.getHomeLogin);
router.get('/getUndoList', HomeController.getUndoList);
router.get('/getSearchKey', HomeController.getSearchKey)

module.exports = router;
