const Router = require("koa-router");
const BlogController = require("../../controller/blog");
const router = new Router();

router.get("/getUserTags", BlogController.getUserTags);
router.post("/addBlog", BlogController.addBlog);
router.get("/getBlogList", BlogController.getBlogList);
router.get("/getBlogDetail", BlogController.getBlogDetail);
router.post("/blogImageUpload", BlogController.blogMediaUpload);
router.post("/modifyBlog", BlogController.blogModify);
router.post('/addComment', BlogController.addComment);
router.get('/getComments', BlogController.queryCommentList);

module.exports = router;
