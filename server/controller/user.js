const { SqlHandler } = require('../model/utils/handleSql');
const { query } = require('../model/utils/query');
const jwt = require('jsonwebtoken');
const { to, genResp } = require('../utils');
const validateUser = require('../model/utils/validateUser');
const fileUpload = require('../routes/utils/upload.js');
const path = require('path');
const iconv = require('iconv-lite');

const handler = SqlHandler();

module.exports = UserController = {
  async register(ctx) {
    const {
      username,
      password,
      email,
      phoneNumber,
      avatarUrl
    } = ctx.request.body;

    try {
      const [err, data] = await to(
        handler.insert(
          'KOA_BLOG_USER',
          ['username', 'password', 'Email', 'phoneNumber', 'avatarUrl'],
          [username, password, email, phoneNumber, avatarUrl]
        )
      );

      if (err) {
        ctx.body = genResp(false, '注册失败', {});
      } else {
        ctx.body = genResp(true, '注册成功');
      }
    } catch (error) {
      console.log(error);
    }
  },
  async userLogin(ctx) {
    const { username, password } = ctx.request.body;
    const [err, data] = await validateUser(username, password);

    if (!err) {
      const {
        userId,
        username: _uname,
        Email,
        avatarUrl,
        password
      } = data.data[0];

      const userInfo = {
        username: _uname,
        userId,
        Email,
        avatarUrl: iconv.decode(avatarUrl, 'UTF-8'),
        password
      };

      const token = jwt.sign(userInfo, 'my_token', { expiresIn: '864000000' });

      ctx.body = {
        status: true,
        msg: '登录成功',
        userInfo: userInfo,
        token
      };
    } else {
      ctx.body = {
        status: false,
        msg: err
      };
    }
  },
  async avatarUploader(ctx) {
    const filePath = path.resolve(__dirname, '../public/images/userIcon/');

    const [err, data] = await to(fileUpload(ctx, filePath));

    const { fileName, status, msg } = data;

    if (!err) {
      ctx.body = {
        status,
        msg,
        avatarUrl: `/images/userIcon/${fileName}`
      };
    } else {
      ctx.body = { status: false, msg: err };
    }
  },
  async checkUsername(ctx) {
    let sql = `Select * from KOA_BLOG_USER where username=\'${ctx.query.username}\'`;
    const data = await query(sql);
    if (data.length) {
      ctx.body = genResp(false, '用户名已存在', {});
    } else {
      ctx.body = genResp(true, '用户名可用', {});
    }
  }
};
