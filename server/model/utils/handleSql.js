const fs = require('fs');
const { query } = require('./query.js');

const SqlHandler = function() {
  return {
    async execSqlFile(filePath) {
      const sql = fs.readFileSync(filePath, 'binary');
      const data = await query(sql).catch(err => {
        console.log('初始化表单失败');
        console.log(err);
      });
      console.log(Array.isArray(data) && '表单初始化成功');
      return this;
    },
    async insert(table, keys, values) {
      let _sql = 'INSERT INTO ??(??) VALUES(?)';
      const data = await query(_sql, [table, keys, values]);
      return data;
    },
    async update(table, updateObj, conditionObj) {
      let _sql = 'UPDATE ?? SET ? WHERE ? ';
      const data = await query(_sql, [table, updateObj, conditionObj]);
      return data;
    },
    async select(table, keys, conditionObj) {
      let _sql = 'SELECT ? FROM ?? WHERE ?';
      const data = await query(_sql, [keys, table, conditionObj]);
      return data;
    },
    async queryCount(table, keys, conditionObj) {
      let _sql = 'SELECT COUNT(?) FROM ?? WHERE ?';
      const data = await query(_sql, [keys, table, conditionObj]);
      return data;
    }
  };
};

module.exports = {
  SqlHandler
};