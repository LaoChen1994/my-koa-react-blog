const { SqlHandler } = require('../model/utils/handleSql');
const { query } = require('../model/utils/query.js');
const { genResp, to } = require('../utils');
const moment = require('moment');
const iconv = require('iconv-lite');

const handler = SqlHandler();

module.exports = TodoController = {
  addTodoItem: async ctx => {
    const { itemInfo } = ctx.request.body;
    const {
      userId,
      todoItem,
      startTime,
      endTime,
      isComplete,
      todoTitle
    } = itemInfo;

    const _startTime = moment(new Date(startTime)).format(
      'YYYY-MM-DD HH:mm:ss'
    );
    const _endTime = moment(new Date(endTime)).format('YYYY-MM-DD HH:mm:ss');

    const [error, data] = await to(
      handler.insert(
        'KOA_TODO',
        [
          'userId',
          'todoItem',
          'startTime',
          'endTime',
          'isComplete',
          'todoTitle'
        ],
        [userId, todoItem, _startTime, _endTime, isComplete, todoTitle]
      )
    );

    if (!error) {
      ctx.body = genResp(true, '已添加代办事项', {});
    } else {
      ctx.body = genResp(false, error, {});
    }
  },
  getTodoList: async ctx => {
    const { userId } = ctx.query;
    const sql = `select * from KOA_TODO where userId=${userId}`;
    let [error, data] = await to(query(sql));
    if (!error) {
      data = data.map(elem => {
        elem.todoItem = iconv.decode(elem.todoItem, 'UTF-8');
        return elem;
      });

      ctx.body = genResp(true, '已获取事件列表', { data });
    } else {
      console.log(error);
      ctx.body = genResp(false, '获取用户数据失败', {});
    }
  },
  finishItem: async ctx => {
    const { todoId } = ctx.query;
    const [err, data] = to(handler.update('KOA_TODO', {isComplete: true}, {todoId}));

    console.log('error = ', err);
    console.log('data=', data);

    ctx.body = genResp(true, '已更新Todo状态');
  }
};
