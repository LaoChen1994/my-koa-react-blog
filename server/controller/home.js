const userValidate = require("../model/utils/validateUser.js");
const jwt = require("jsonwebtoken");
const { to, setCtxBody } = require("../utils");
const { query } = require("../model/utils/query");
const moment = require("moment");
const iconv = require("iconv-lite");

// 后端重构的思路
// 大部分代码都可以提出来的，接口只需调用通用函数，再加上特定的处理方法即可

module.exports = {
  async getHomeLogin(ctx) {
    const { user } = ctx.state;
    const { password = "", ...res } = user;
    const { username = "" } = res;

    const [err, data] = await userValidate(username, password);

    if (!err) {
      const token = jwt.sign(user, "my_token");
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

    setCtxBody(err, { blogList: data }, ctx, "", "获取博客列表失败");
  },
  async getUndoList(ctx) {
    const { userId } = ctx.query;
    const sql = `select * from KOA_TODO where userId=${userId} and isComplete=false limit 5`;
    let [err, data] = await to(query(sql));

    if (!err) {
      data = data.map(elem => {
        elem.todoItem = iconv.decode(elem.todoItem, "UTF-8");
        elem.startTime = moment(new Date(elem.startTime)).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        elem.endTime = moment(new Date(elem.endTime)).format(
          "YYYY-MM-DD HH:mm:ss"
        );

        return elem;
      });
    }

    setCtxBody(err, { undoList: data }, ctx, "", "获取代办事项列表失败");
  },
  async getSearchKey(ctx) {
    const { keyword, pageSize = 5, pageNumber = 1, userId = "" } = ctx.query;

    const sql = `select e.blogId,e.blogName,e.blogContent,e.publishDate,e.tagsId,d.userName,e.authorId,e.lastUpdateTime,d.avatarUrl from KOA_BLOG_CONTENT e inner join KOA_BLOG_USER d where e.authorId=d.userId and (INSTR(e.blogContent,'${keyword}') or INSTR(e.blogName,"${keyword}")) ${
      userId ? "and userId=" + userId : ""
    } group by e.blogId order by e.blogId desc limit ${(pageNumber - 1) *
      pageSize},${pageNumber * pageSize}`;

    const sqlNumber = `select COUNT(*) as totalNumber from KOA_BLOG_CONTENT e inner join KOA_BLOG_USER d where e.authorId=d.userId and (INSTR(e.blogContent,'${keyword}') or INSTR(e.blogName,"${keyword}")) ${
      userId ? "and userId=" + userId : ""
    }`;

    const setSqlMode =
      'set @@global.sql_mode="STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION"';

    const setMode =
      'set sql_mode ="STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION"';
    const _q1 = query(setMode);
    const _q2 = query(setSqlMode);
    const _q3 = query(sqlNumber);

    const [modeErr, modeSucc] = await to(Promise.all([_q1, _q2, _q3]));

    if (!modeErr) {
      const [err, data] = await to(query(sql));
      const regx = /<.+?>/gi;
      const totalNumber = modeSucc[2] ? modeSucc[2][0].totalNumber : 0;

      setCtxBody(
        err,
        {
          blogList: data.map(elem => {
            elem.avatarUrl = elem.avatarUrl
              ? iconv.decode(elem.avatarUrl, "UTF-8")
              : "";
            elem.blogContent = elem.blogContent.replace(regx, "");
            return elem;
          }),
          totalNumber
        },
        ctx,
        "请求成功",
        "搜索博文失败"
      );
      return;
    }
    setCtxBody(true, [], ctx, "", "数据库错误");
  }
};
