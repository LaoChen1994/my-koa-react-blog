const router = require('koa-router')();
const UserController = require('../../controller/user.js');

router.post('/login', UserController.userLogin);
router.post('/register', UserController.register);
router.post('/upload', UserController.avatarUploader);
router.get('/userValidate', UserController.checkUsername);
router.get('/getUserInfo', UserController.getUserInfo);

module.exports = router;
