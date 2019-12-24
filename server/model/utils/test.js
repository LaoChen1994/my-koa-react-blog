const { SqlHandler } = require('./handleSql.js');

const utils = SqlHandler();

/**
 * 插入数据
 */
utils.insert(
  'KOA_BLOG_USER',
  ['username', 'password', 'Email', 'phoneNumber'],
  ['cyx', '123456', '123@qq.com', '123456789']
);

/**
 * 更新数据
 */
utils.update(
  'KOA_BLOG_USER',
  { username: 'cyx1', password: '456789' },
  { userId: 2 }
);

/**
 * 查询数据
 */
async function selectData() {
  const data = await utils.select(
    'KOA_BLOG_USER',
    ['userId', 'username', 'password'],
    { userId: 2 }
  );
  console.log(data);
}

selectData();
