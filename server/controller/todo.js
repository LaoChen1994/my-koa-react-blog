const { SqlHandler } = require('../model/utils/handleSql');
const { query } = require('../model/utils/query.js');
const { genResp, to, setCtxBody, timeFormat } = require('../utils');
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
        elem.startTime = moment(new Date(elem.startTime)).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        elem.endTime = moment(new Date(elem.endTime)).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        return elem;
      });

      ctx.body = genResp(true, '已获取事件列表', { data });
    } else {
      ctx.body = genResp(false, '获取用户数据失败', {});
    }
  },
  finishItem: async ctx => {
    const { todoId } = ctx.query;
    const sql = `select * from KOA_TODO where todoId=${todoId}`;
    let isExpire = false;
    let completeTime = timeFormat(new Date().toString());
    const [err, data] = await to(query(sql));

    if (!err & data.length) {
      const { endTime } = data[0];
      const end = new Date(endTime);

      isExpire = end > new Date();
    } else {
      setCtxBody('事件不存在', {}, ctx, '', '事件不存在');
      return;
    }

    if (todoId && todoId !== -1) {
      const [err, data] = await to(
        handler.update(
          'KOA_TODO',
          { isComplete: true, isExpire, completeTime },
          { todoId }
        )
      );
      setCtxBody(err, data, ctx, '对应事件已完成', '项目完成失败');
    } else {
      setCtxBody('用户ID读取失败', {}, ctx, '', '用户ID读取失败');
    }
  },
  recallTodo: async ctx => {
    const { todoId } = ctx.query;
    if (todoId && todoId !== -1) {
      const [err, data] = await to(
        handler.update(
          'KOA_TODO',
          { isComplete: false, completeTime: null },
          { todoId }
        )
      );
      setCtxBody(err, data, ctx, '已撤回执行状态', '撤回失败');
    } else {
      setCtxBody('用户ID读取失败', {}, ctx, '', '用户ID读取失败');
    }
  },
  deleteTodo: async ctx => {
    const { todoId } = ctx.query;

    const sql = `DELETE FROM KOA_TODO WHERE todoId=${todoId}`;

    if (todoId && todoId !== -1) {
      const [err, data] = await to(query(sql));
      setCtxBody(err, data, ctx, '删除事件成功', '删除事件失败');
    } else {
      setCtxBody('用户ID读取失败', {}, ctx, '', '用户ID读取失败');
    }
  },
  clearAll: async ctx => {
    const { todoIds = [] } = ctx.request.body;

    if (todoIds && todoIds.length) {
      const sql = `DELETE FROM KOA_TODO WHERE todoId IN (${todoIds.join(',')})`;
      const [err, data] = await to(query(sql));

      if (!err) {
        ctx.body = genResp(true, '已经清空代办事项列表', {});
      } else {
        ctx.body = genResp(false, '清空列表失败', err);
      }
    } else {
      ctx.body = genResp(false, '未获取有效事项ID', {});
    }
  },
  modifyItem: async ctx => {
    const data = ctx.request.body;
    const { todoId, todoItem, todoTitle, startTime, endTime } = data;
    console.log(data);
    const _startTime = timeFormat(startTime);
    const _endTime = timeFormat(endTime);

    const [err, msg] = await to(
      handler.update(
        'KOA_TODO',
        {
          todoItem,
          todoTitle,
          startTime: _startTime,
          endTime: _endTime
        },
        { todoId }
      )
    );

    setCtxBody(err, msg, ctx, '修改代办事项成功', '修改代办事项失败');
  },
  alterEvent: async ctx => {
    const { type: isHistory, userId } = ctx.query;

    if (~userId) {
      let sql = `select * from KOA_TODO where userId=${userId} and isComplete=true and DATE_FORMAT(completeTime,\'%Y%m%d\')=DATE_FORMAT(CURRENT_DATE(),\'%Y%m%d\')`;
      if (isHistory === 'true') {
        sql = `select * from KOA_TODO where userId=${userId} and isComplete=true`;
      }

      const [err, data] = await to(query(sql));

      const _data = data.map(elem => {
        elem.startTime = timeFormat(elem.startTime);
        elem.endTime = timeFormat(elem.endTime);
        elem.todoItem = iconv.decode(elem.todoItem, 'UTF-8');
        elem.completeTime = timeFormat(elem.completeTime);
        return elem;
      });

      setCtxBody(err, _data, ctx, '', '');
    } else {
      setCtxBody(1, {}, ctx, '用户不存在', '');
    }
  }
};
