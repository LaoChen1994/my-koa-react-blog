const MIMEMAP = require('./public/javascripts/mime.js');

module.exports = {
  to: promise => promise.then(data => [null, data]).catch(err => [err]),
  genResp: (status, msg, data) => ({
    status,
    msg,
    data
  }),
  isImage(extname) {
    return MIMEMAP[extname].startsWith('image')
  }
};
