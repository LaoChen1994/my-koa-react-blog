const router = require('koa-router')();
const TodoController = require('../../controller/todo.js');

router.post('/addTodoItem', TodoController.addTodoItem);
router.get('/getTodoList', TodoController.getTodoList);
router.get('/finishItem', TodoController.finishItem);
router.get('/recallTodo', TodoController.recallTodo);
router.get('/deleteTodo', TodoController.deleteTodo);
router.post('/clearAll', TodoController.clearAll);
router.post('/modify', TodoController.modifyItem)

module.exports = router;
