const router = require('koa-router')();
const UserController = require('../../controller/user.js');

router.post('/login', UserController.userLogin);
router.post('/register', UserController.register);
router.post('/upload', UserController.avatarUploader);
router.get('/userValidate', UserController.checkUsername);
router.get('/getUserInfo', UserController.getUserInfo);
router.post('/modifyAvatar', UserController.modifyAvatar);
router.post('/updateUserAvatar', UserController.updateUserAvatar);
router.post('/updateUserInfo', UserController.updateUserInfo);

module.exports = router;
