const userValidate = require('../model/utils/validateUser.js');
const jwt = require('jsonwebtoken');

module.exports = {
  async getHomeLogin(ctx) {
    const { user } = ctx.state;
    const { password = '', ...res } = user;
    const { username = '' } = res;

    const [err, data] = await userValidate(username, password);

    if (!err) {
      const token = jwt.sign(user, 'my_token');
      ctx.body = { ...data, userInfo: res, token };
    } else {
      ctx.status = 401;
      ctx.body = { status: false, msg: err };
    }
  }
};
