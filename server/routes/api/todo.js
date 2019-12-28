const router = require('koa-router')();
const TodoController = require('../../controller/todo.js');

router.post('/addTodoItem', TodoController.addTodoItem);
router.get('/getTodoList', TodoController.getTodoList);
router.get('/finishItem', TodoController.finishItem);

module.exports = router;
