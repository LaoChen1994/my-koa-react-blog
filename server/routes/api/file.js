const Router = require('koa-router');
const router = new Router();

const FileController = require('../../controller/file.js');

router.post('/fileUpload', FileController.fileUpload);


module.exports = router