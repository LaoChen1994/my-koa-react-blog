const userValidate = require('../model/utils/validateUser.js');
const jwt = require('jsonwebtoken');
const { to, setCtxBody } = require('../utils');
const { query } = require('../model/utils/query');
const moment = require('moment');
const iconv = require('iconv-lite');

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
  },
  async getBlogList(ctx) {
    const { pageSize = 10, pageNumber = 0 } = ctx.query;

    const sql = `select * from KOA_BLOG_CONTENT order by blogId desc limit ${pageNumber *
      pageSize},${(pageNumber + 1) * pageSize}`;
    const [err, data] = await to(query(sql));

    setCtxBody(err, { blogList: data }, ctx, '', '获取博客列表失败');
  },
  async getUndoList(ctx) {
    const { userId } = ctx.query;
    const sql = `select * from KOA_TODO where userId=${userId} and isComplete=false limit 5`;
    let [err, data] = await to(query(sql));

    if (!err) {
      data = data.map(elem => {
        elem.todoItem = iconv.decode(elem.todoItem, 'UTF-8');
        elem.startTime = moment(new Date(elem.startTime)).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        elem.endTime = moment(new Date(elem.endTime)).format(
          'YYYY-MM-DD HH:mm:ss'
        );

        return elem;
      });
    }

    setCtxBody(err, { undoList: data }, ctx, '', '获取代办事项列表失败');
  }
};
