const { setCtxBody, genResp, to, timeFormat } = require("../utils");
const { SqlHandler } = require("../model/utils/handleSql");
const { query } = require("../model/utils/query");
const iconv = require("iconv-lite");
const uploadFile = require("../routes/utils/upload.js");
const path = require("path");

const getBlogTags = tagStr => tagStr.split(",").map(elem => +elem);
const setBlogTags = tagList => tagList.join(",");

const handleTags = async (tags, userId) => {
  // 添加新的标签，这里要查询是否这个标签用户已经添加
  //　如果这个标签有了就不能再添加
  const newTags = tags.filter(elem => elem.isNew).map(elem => elem.tagName);
  const oldTags = tags.filter(elem => !elem.isNew);

  const [tagsError, _] = await to(tagsIsExist(newTags, userId));

  if (tagsError) {
    ctx.body = genResp(tagsError.status, tagsError.msg, {});
    return;
  }

  const oldTagUpdateSql = `UPDATE KOA_BLOG_TAGS SET articalNumber = CASE tagId${oldTags
    .map(elem => " WHEN " + elem.tagId + " THEN " + (elem.articalNumber + 1))
    .join(" ")} END WHERE tagId in (${oldTags.map(x => x.tagId)})`;
  const oldTagExec = oldTags.length ? query(oldTagUpdateSql) : {};

  const addNewTagsSql = `INSERT INTO KOA_BLOG_TAGS (tagName,userId) VALUES${newTags
    .map(elem => "('" + elem.toString() + "'," + userId + ")")
    .join(",")}`;

  const newTagExec = newTags.length ? query(addNewTagsSql) : {};

  return Promise.all([oldTagExec, oldTags, newTagExec]);
};

const formatBlogContent = contentList =>
  contentList.map(elem => {
    elem.publishDate = timeFormat(elem.publishDate);
    elem.lastUpdateTime = timeFormat(elem.lastUpdateTime);
    elem.tagsId = getBlogTags(elem.tagsId);
    return elem;
  });

const formatAvatarUrl = elem => {
  elem.avatarUrl = elem.avatarUrl ? iconv.decode(elem.avatarUrl, "UTF-8") : "";
  return elem;
};

const tagsIsExist = async (newTags, userId) =>
  new Promise(async (resolve, reject) => {
    if (newTags.length === 0) {
      resolve({ status: true, msg: "无新标签" });
      return;
    }
    const sql = `select * from KOA_BLOG_TAGS where userId=${userId} and tagName in (${newTags.map(
      elem => "'" + elem + "'"
    )})`;
    const data = await query(sql);

    if (data.length) {
      reject({ status: false, msg: "文章标签已经存在" });
    } else {
      resolve({ status: true, msg: "文章标签添加成功" });
    }
  });

const handler = SqlHandler();

module.exports = {
  async getUserTags(ctx) {
    const { userId } = ctx.query;
    const sql = `select * from KOA_BLOG_TAGS where userId=${userId}`;
    const [error, data] = await to(query(sql));
    setCtxBody(error, data, ctx, "列表请求成功", "列表请求错误");
  },
  async addBlog(ctx) {
    const { userId, blogContent } = ctx.request.body;
    const { title, tags, content } = blogContent;

    // 添加新的标签，这里要查询是否这个标签用户已经添加
    //　如果这个标签有了就不能再添加
    const newTags = tags.filter(elem => elem.isNew).map(elem => elem.tagName);
    const oldTags = tags.filter(elem => !elem.isNew);

    const [tagsError, _] = await to(tagsIsExist(newTags, userId));

    if (tagsError) {
      ctx.body = genResp(tagsError.status, tagsError.msg, {});
      return;
    }

    const oldTagUpdateSql = `UPDATE KOA_BLOG_TAGS SET articalNumber = CASE tagId${oldTags
      .map(elem => " WHEN " + elem.tagId + " THEN " + (elem.articalNumber + 1))
      .join(" ")} END WHERE tagId in (${oldTags.map(x => x.tagId)})`;
    const oldTagExec = oldTags.length ? query(oldTagUpdateSql) : {};

    const addNewTagsSql = `INSERT INTO KOA_BLOG_TAGS (tagName,userId) VALUES${newTags
      .map(elem => "('" + elem.toString() + "'," + userId + ")")
      .join(",")}`;

    const newTagExec = newTags.length ? query(addNewTagsSql) : {};

    const [err, data] = await to(Promise.all([oldTagExec, newTagExec]));

    if (!err) {
      const newTagRes = data[1];
      const { affectedRows = 0, insertId } = newTagRes;

      const tagList = setBlogTags(
        [
          ...oldTags.map(elem => elem.tagId),
          ...Array.from({ length: affectedRows }).map(
            (elem, index) => index + insertId
          )
        ].sort((x, y) => x - y)
      );

      const [blogErr, blogData] = await to(
        handler.insert(
          "KOA_BLOG_CONTENT",
          ["blogName", "blogContent", "authorId", "tagsId"],
          [title, content, userId, tagList]
        )
      );

      setCtxBody(blogErr, {}, ctx, "标签添加成功", "标签添加失败");
    } else {
      console.log(err);
      ctx.body = genResp(false, "添加标签失败", []);
    }
  },
  async getBlogList(ctx) {
    const { pageSize = 10, pageNumber = 0, userId } = ctx.query;

    const sql = `select e.blogId,e.blogName,e.blogContent,e.publishDate,e.tagsId,d.userName,e.authorId,e.lastUpdateTime,d.avatarUrl from KOA_BLOG_CONTENT e inner join KOA_BLOG_USER d where e.authorId=d.userId ${
      userId ? "and userId=" + userId : ""
    } order by blogId desc limit ${pageNumber * pageSize},${(pageNumber + 1) *
      pageSize}`;

    const countSql = `select COUNT(*) as totalNumber from KOA_BLOG_CONTENT e inner join KOA_BLOG_USER d where e.authorId=d.userId  ${
      userId ? "and userId=" + userId : ""
    }`;
    let [_, count] = await to(query(countSql));

    let [err, data] = await to(query(sql));
    let regx = /<.+?>/gi;

    data = data.map(elem => {
      elem = formatAvatarUrl(elem);
      elem.blogContent = elem.blogContent.replace(regx, "");
      return elem;
    });

    setCtxBody(
      err,
      { blogList: formatBlogContent(data), totalNumber: count[0].totalNumber },
      ctx,
      "",
      "获取博客列表失败"
    );
  },
  async getBlogDetail(ctx) {
    const { blogId } = ctx.query;
    const sqlContent = `select c.blogId,c.blogName,c.lastUpdateTime,c.authorId,c.tagsId,c.publishDate,d.userName as username,c.blogContent,d.avatarUrl from KOA_BLOG_CONTENT c, KOA_BLOG_USER d where c.blogId=${blogId} and c.authorId=d.userId`;
    const [contentErr, content] = await to(query(sqlContent));
    if (contentErr) {
      setCtxBody(contentErr, {}, ctx, "", "文章信息查询失败！");
      return;
    } else if (!content.length) {
      setCtxBody(true, {}, ctx, "", "该文章不存在或者已被删除！");
      return;
    }
    const tagsId = getBlogTags(content[0].tagsId);
    const userId = content[0].authorId;
    const sqlTags = `select * from KOA_BLOG_TAGS where tagId in (${tagsId})`;
    const [tagsErr, tags] = await to(query(sqlTags));
    const [numberErr, totalBlog] = await to(
      query(
        `select Count(*) as number from KOA_BLOG_CONTENT where authorId=${userId}`
      )
    );
    content[0].lastUpdateTime = timeFormat(content[0].lastUpdateTime);
    content[0].publishDate = timeFormat(content[0].publishDate);
    content[0].avatarUrl = formatAvatarUrl(content[0]).avatarUrl;
    if (numberErr) {
      setCtxBody(true, {}, ctx, "", "拉取作者信息失败");
      return;
    }

    setCtxBody(
      tagsErr,
      {
        ...content[0],
        tags,
        blogNumber: totalBlog[0].number
      },
      ctx,
      "查询成功",
      "标签查询失败"
    );
  },
  async blogMediaUpload(ctx) {
    const [err, data] = await to(
      uploadFile(ctx, path.resolve(__dirname, "../public/images/blogImage/"))
    );
    if (!err) {
      const regx = /(\/image.*)/gi;
      regx.exec(data.filePath);
      data.filePath = RegExp.$1;
    }
    setCtxBody(err, data, ctx, "添加文章成功", "新增博文失败");
  },
  async blogModify(ctx) {
    const { blogId, blogName, blogContent, tagsId, userId } = ctx.request.body;
    const [tagsErr, tagsData] = await to(handleTags(tagsId, userId));

    if (!tagsErr) {
      const [oldTagsData, oldTags, newTagsData] = tagsData;
      const tagLIsts = [
        ...oldTags.map(elem => elem.tagId),
        ...Array.from({ length: newTagsData.affectedRows }).map(
          (elem, index) => index + newTagsData.insertId
        )
      ];

      const [err, data] = await to(
        handler.update(
          "KOA_BLOG_CONTENT",
          { blogContent, blogName, tagsId: setBlogTags(tagLIsts) },
          { blogId }
        )
      );

      setCtxBody(err, data, ctx, "更新文章成功", "更新文章失败");
      return;
    }

    setCtxBody(true, {}, "", "添加标签失败");
  },
  async addComment(ctx) {
    const { authorId, commentItem, belongId, belongText } = ctx.request.body;
    const [err, data] = await to(
      handler.insert(
        "KOA_BLOG_COMMENT",
        ["authorId", "commentItem", "belongId", "belongText"],
        [authorId,  commentItem, belongId, belongText]
      )
    );

    setCtxBody(err, data, ctx, "添加评论成功", "添加评论失败");
  },
  async queryCommentList(ctx) {
    const { blogId, pageSize = 5, pageNumber = 1 } = ctx.query;
    const sql = `SELECT e.*,u.userName,u.avatarUrl as totalNumber FROM KOA_BLOG_COMMENT e, KOA_BLOG_USER u where belongText=${blogId} and e.authorId=u.userId limit ${(pageNumber -
      1) *
      pageSize},${pageNumber * pageSize}`;
    let [err, data] = await to(query(sql));

    if (!err) {
      data = data.map(elem => {
        elem.commentDate = timeFormat(elem.commentDate);
        elem.avatarUrl = elem.avatarUrl
          ? iconv.decode(elem.avatarUrl, "UTF-8")
          : "";
        return elem;
      });
    }

    setCtxBody(err, data, ctx, "列表获取成功", "列表获取失败");
  }
};
