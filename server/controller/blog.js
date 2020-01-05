const { setCtxBody, genResp, to } = require('../utils');
const { SqlHandler } = require('../model/utils/handleSql');
const { query } = require('../model/utils/query');

const getBlogTags = tagStr => tagStr.split(',').map(elem => +elem);
const setBlogTags = tagList => tagList.join(',');

const tagsIsExist = async (newTags, userId) =>
  new Promise(async (resolve, reject) => {
    const sql = `select * from KOA_BLOG_TAGS where userId=${userId} and tagName in (${newTags.map(
      elem => "'" + elem + "'"
    )})`;
    const data = await query(sql);

    if (data.length) {
      reject({ status: false, msg: '文章标签已经存在' });
    } else {
      resolve({ status: true, msg: '文章标签添加成功' });
    }
  });

const handler = SqlHandler();

module.exports = {
  async getUserTags(ctx) {
    const { userId } = ctx.query;
    const sql = `select * from KOA_BLOG_TAGS where userId=${userId}`;
    const [error, data] = await to(query(sql));
    setCtxBody(error, data, ctx, '列表请求成功', '列表请求错误');
  },
  async addBlog(ctx) {
    const { userId, blogContent } = ctx.request.body;
    const { title, tags, content } = blogContent;

    // 添加新的标签，这里要查询是否这个标签用户已经添加
    //　如果这个标签有了就不能再添加
    const newTags = tags.filter(elem => elem.isNew).map(elem => elem.tagName);
    const oldTags = tags.filter(elem => !elem.isNew);

    const [tagsError, tagsData] = await to(tagsIsExist(newTags, userId));

    if (tagsError) {
      ctx.body = genResp(tagsError.status, tagsError.msg, {});
      return;
    }

    const oldTagUpdateSql = `UPDATE KOA_BLOG_TAGS SET articalNumber = CASE tagId${oldTags
      .map(elem => ' WHEN ' + elem.tagId + ' THEN ' + (elem.articalNumber + 1))
      .join(' ')} END WHERE tagId in (${oldTags.map(x => x.tagId)})`;

    const addNewTagsSql = `INSERT INTO KOA_BLOG_TAGS (tagName,userId) VALUES${newTags
      .map(elem => '(\'' + elem.toString() + '\',' + userId + ')')
      .join(',')}`;

    const oldTagExec = query(oldTagUpdateSql);
    const newTagExec = query(addNewTagsSql);

    const [err, data] = await to(Promise.all([oldTagExec, newTagExec]));

    if (!err) {
      const newTagRes = data[1];
      const { affectedRows, insertId } = newTagRes;

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
          'KOA_BLOG_CONTENT',
          ['blogName', 'blogContent', 'authorId', 'tagsId'],
          [title, content, userId, tagList]
        )
      );

      setCtxBody(null, {}, ctx, 'success', 'error');
    } else {
      console.log(err);
      ctx.body = genResp(false, '添加标签失败', []);
    }
  }
};
