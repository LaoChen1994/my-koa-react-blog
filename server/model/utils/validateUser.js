const { query } = require('./query');

module.exports = async function userValidate(username, password) {
  let sql = `Select * from KOA_BLOG_USER where username=\'${username}\' and password=\'${password}\'`;

  return new Promise((resolve, reject) => {
    const _a = async () => {
      const data = await query(sql).catch(error => {
        console.log(error);
        reject('数据库查询失败');
      });
      if (data.length) {
        resolve({ status: true, msg: '认证成功', data });
      } else {
        reject('用户不存在或密码错误');
      }
    };
    _a();
  })
    .then(data => [null, data])
    .catch(err => [err]);
};
