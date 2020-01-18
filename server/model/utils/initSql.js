const { SqlHandler } = require("./handleSql");
const path = require("path");
const fs = require("fs");

const sqlDir = path.resolve(__dirname, "../sql/");

const files = fs.readdirSync(sqlDir);
console.log(files);

const handler = SqlHandler();

files.reverse.map(elem => {
  handler.execSqlFile(path.resolve(sqlDir, elem));
});

// handler.execSqlFile(path.resolve(__dirname, "../sql/initFileCenter.sql"));
