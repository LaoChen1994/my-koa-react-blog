const MIMEMAP = require('./public/javascripts/mime.js');
const moment = require('moment');

const genResp = (status, msg, data) => ({
  status,
  msg,
  data
});

module.exports = {
  to: promise => promise.then(data => [null, data]).catch(err => [err]),
  genResp,
  isImage(extname) {
    return MIMEMAP[extname].startsWith('image');
  },
  setCtxBody: (error, data, ctx, okMsg, errorMsg) => {
    if (!error) {
      console.log(data);
      data = data || {};
      ctx.body = genResp(true, okMsg, data);
    } else {
      console.log(error);
      errorMsg = errorMsg | '内部服务器错误';
      ctx.body = genResp(false, okMsg, {});
    }
  },
  timeFormat: timeStr => moment(new Date(timeStr)).format('YYYY-MM-DD HH:mm:ss')
};
