const upLoadFile = require('../routes/utils/upload');
const path = require('path');
const { setCtxBody, to, timeFormat, genResp } = require('../utils.js');
const { query } = require('../model/utils/query.js');
const { SqlHandler } = require('../model/utils/handleSql');
const iconv = require('iconv-lite');

const handler = SqlHandler();

module.exports = {
  async fileUpload(ctx) {
    const [err, data] = await to(
      upLoadFile(ctx, path.resolve(__dirname, '../public/userFile/'))
    );
    setCtxBody(
      err,
      {
        ...data,
        filePath: `/userFile/${data.fileName}`
      },
      ctx,
      'ok',
      'error'
    );
  },
  async addNewFile(ctx) {
    const { fileBrief, location, fileName, authorId } = ctx.request.body;
    const [err, data] = await to(
      handler.insert(
        'KOA_BLOG_FILE',
        ['fileName', 'fileBrief', 'authorId', 'location'],
        [fileName, fileBrief, authorId, location]
      )
    );

    setCtxBody(err, {}, ctx, '上传文件成功', '上传文件失败');
  },
  async getFileList(ctx) {
    const { pageNumber, pageSize, userId } = ctx.query;
    const sql = `select f.fileId,f.fileName,f.publishDate,f.fileBrief,f.downloadNumber,f.location,u.userId,u.userName as username,u.avatarUrl from KOA_BLOG_FILE f, KOA_BLOG_USER u where u.userId=f.authorId ${
      userId ? `and u.userId=${userId}` : ''
    } order by fileId desc limit ${(pageNumber - 1) * pageSize},${pageNumber * pageSize}`;

    let [err, data] = await to(query(sql));

    if (!err) {
      data = data.map(elem => {
        elem.avatarUrl = iconv.decode(elem.avatarUrl, 'UTF-8');
        elem.publishDate = timeFormat(elem.publishDate);
        return elem;
      });
    }

    setCtxBody(err, data, ctx, '', '获取列表失败');
  },
  async addDownloadNumber(ctx) {
    const { fileId } = ctx.query;
    const [err, data] = await to(
      query(`select downloadNumber from KOA_BLOG_FILE where fileId=${fileId}`)
    );
    if (!err && data.length) {
      const { downloadNumber } = data[0];
      const [_e, _d] = await to(
        handler.update('KOA_BLOG_FILE', { downloadNumber: downloadNumber + 1 }, { fileId })
      );
      console.log(_d);
      if (!_e) {
        setCtxBody(true, {}, ctx, '已增加下载量', '');
      } else {
        setCtxBody(false, {}, ctx, '', '增加下载量失败');
      }
      return;
    }

    setCtxBody(false, {}, ctx, '', '增加下载量失败');
  }
};
