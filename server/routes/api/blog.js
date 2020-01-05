const Router = require('koa-router');
const BlogController = require('../../controller/blog');
const router = new Router();

router.get('/getUserTags', BlogController.getUserTags);
router.post('/addBlog', BlogController.addBlog);


module.exports = router