const fs = require('fs');
const path = require('path');
const { isImage } = require('../../utils');

const uploadFile = async (ctx, filePath) => {
  const file = ctx.request.files.file;
  const extname = path.extname(file.name);

  const fileName = `${Math.random()
    .toString(36)
    .substr(2)}${extname}`;

  const fileLocation = `${filePath}/${fileName}`;

  return new Promise((resolve, reject) => {
    try {
      // if (isImage(extname.substr(1))) {
        const reader = fs.createReadStream(file.path);
        const writer = fs.createWriteStream(fileLocation);

        reader.pipe(writer);
      // } else {
      // }

      resolve({
        status: true,
        msg: `文件:${fileName} 创建成功`,
        filePath: fileLocation,
        fileName
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = uploadFile;
