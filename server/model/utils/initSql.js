const {SqlHandler} = require('./handleSql');
const path = require('path');

const handler = SqlHandler()

handler.execSqlFile(path.resolve(__dirname, '../sql/initTagsBlog.sql'));