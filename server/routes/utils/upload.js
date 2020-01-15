const fs = require('fs');
const path = require('path');

const uploadFile = async (ctx, filePath) => {
  const file = ctx.request.files.file;
  const extname = path.extname(file.name);

  let fileName = `${Math.random()
    .toString(36)
    .substr(2)}${extname}`;

  let fileLocation = `${filePath}/${fileName}`;

  while (fs.existsSync(fileLocation)) {
    fileName = `${Math.random()
      .toString(36)
      .substr(2)}${extname}`;
  
    fileLocation = `${filePath}/${fileName}`;
  }

  return new Promise((resolve, reject) => {
    try {
        const reader = fs.createReadStream(file.path);
        const writer = fs.createWriteStream(fileLocation);

        reader.pipe(writer);

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
