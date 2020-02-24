const { SqlHandler } = require("../model/utils/handleSql");
const { query } = require("../model/utils/query");
const jwt = require("jsonwebtoken");
const { to, genResp, setCtxBody } = require("../utils");
const validateUser = require("../model/utils/validateUser");
const fileUpload = require("../routes/utils/upload.js");
const path = require("path");
const iconv = require("iconv-lite");
const uploadFile = require("../routes/utils/upload.js");
const moment = require("moment");

const handler = SqlHandler();

function handlerAvatarUrl(userInfo) {
  userInfo.avatarUrl &&
    (userInfo.avatarUrl = iconv.decode(userInfo.avatarUrl, "UTF-8"));
}

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
          "KOA_BLOG_USER",
          ["username", "password", "Email", "phoneNumber", "avatarUrl"],
          [username, password, email, phoneNumber, avatarUrl]
        )
      );

      if (err) {
        ctx.body = genResp(false, "注册失败", {});
      } else {
        ctx.body = genResp(true, "注册成功");
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
        avatarUrl: avatarUrl ? iconv.decode(avatarUrl, "UTF-8") : "",
        password
      };

      const token = jwt.sign(userInfo, "my_token", { expiresIn: "864000000" });

      ctx.body = {
        status: true,
        msg: "登录成功",
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
    const filePath = path.resolve(__dirname, "../public/images/userIcon/");

    const [err, data] = await to(fileUpload(ctx, filePath));

    if (!err) {
      const { fileName, status, msg } = data;
      ctx.body = {
        fileName,
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
      ctx.body = genResp(false, "用户名已存在", {});
    } else {
      ctx.body = genResp(true, "用户名可用", {});
    }
  },
  async getUserInfo(ctx) {
    const { userId } = ctx.query;
    if (!userId && ~userId) {
      ctx.body = genResp(false, "无法识别用户");
      return;
    }

    // 为什么要写这么难受的sql语言呢
    // 因为 前端typescript接口先写好了，好吧 我是猪
    // 为了让前端弄的简单点，这个sql语句只能如此不堪入目了
    // 因为前端代码直接遍历返回的数组
    // 所以显示顺序和后端返回对象的字段顺序挂钩

    const sql = `select u.userId,u.username as userName,u.nicoName,u.Email,u.avatarUrl,u.birth,u.phoneNumber,u.introduction,Count(c.blogId) as blogNumber from KOA_BLOG_USER u,KOA_BLOG_CONTENT c where u.userId=${userId} and u.userId=c.authorId`;
    const [err, data] = await to(query(sql));
    if (!err) {
      handlerAvatarUrl(data[0]);
    }

    data[0].birth = moment(new Date(data[0].birth)).format("YYYY-MM-DD");

    setCtxBody(err, data[0], ctx, "", "");
  },
  async modifyAvatar(ctx) {
    const [err, data] = await to(
      uploadFile(ctx, path.resolve(__dirname, "../public/images/userIcon/"))
    );

    const regx = /[\/|\w|-]+?(\/image.*)/gi;
    if (!err) {
      regx.exec(data.filePath);
      data.filePath = RegExp.$1;
    }

    setCtxBody(err, data, ctx, "上传文件成功", "上传文件失败");
  },
  async updateUserAvatar(ctx) {
    const { userId, avatarUrl } = ctx.request.body;
    const sql = `update KOA_BLOG_USER set avatarUrl=\"${avatarUrl}\" where userId=${userId}`;
    const [err, data] = await to(query(sql));

    // 因为本身本地的登录信息内容，是通过token来进行本地保存的
    // 所以这里还需要重新返回一个token
    if (!err) {
      const tokenSql = `select * from KOA_BLOG_USER where userId=${userId}`;

      const [err, data] = await to(query(tokenSql));

      if (!err) {
        const { username, password, Email, avatarUrl } = data[0];
        const userInfo = {
          username,
          userId,
          Email,
          avatarUrl: avatarUrl ? iconv.decode(avatarUrl, "UTF-8") : "",
          password
        };

        const token = jwt.sign(userInfo, "my_token", { expiresIn: 864000 });
        setCtxBody(err, { token }, ctx, "更新用户头像成功", "");
        return;
      }
    }

    setCtxBody(false, {}, ctx, "", "获取用户信息失败");
  },
  async updateUserInfo(ctx) {
    const {
      userId,
      Email,
      birth,
      nicoName,
      introduction,
      phoneNumber
    } = ctx.request.body;

    const birthDate = !birth
      ? null
      : moment(new Date(birth)).format("YYYY-MM-DD");

    const sql = `update KOA_BLOG_USER set Email="${Email}",birth="${birthDate}",nicoName="${nicoName}",phoneNumber="${phoneNumber}",introduction="${introduction}" where userId=${userId}`;
    const [err, data] = await to(query(sql));
    setCtxBody(err, data, ctx, "更新成功", "更新用户信息失败");
  }
};
