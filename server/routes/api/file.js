const Router = require('koa-router');
const router = new Router();

const FileController = require('../../controller/file.js');

router.post('/fileUpload', FileController.fileUpload);
router.post('/addNewFile', FileController.addNewFile);
router.get('/getFileList', FileController.getFileList);
router.get('/addDownload', FileController.addDownloadNumber)


module.exports = router