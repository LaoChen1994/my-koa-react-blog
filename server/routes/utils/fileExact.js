const fs = require('fs')

module.exports = {
  fileExact: (path,status) => {
    fs.stat(path, (err, stats) => {
      if(!err) {
        console.log(stats.isFile)
      } else {
        console.log(err)
      }
    });
    
  }
}
