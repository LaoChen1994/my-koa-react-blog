const mysql = require('mysql');
const { sqlConfig } = require('../config');

const pool = mysql.createPool(sqlConfig);

const query = (sql, value) =>
  new Promise((resolve, reject) => {
    pool.getConnection((e, connection) => {
      if (e) {
        reject(e);
      } else {
        connection.query(sql, value, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
        connection.release();
      }
    });
  });

module.exports = { query };
