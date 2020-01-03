import {
  TAddTodoItem,
  TGetTodoList,
  TFinishItem,
  TClearAll,
  TModifyTodoItem,
  TGetCompleteList
} from './interface';
import axios from 'axios';
import { ApiHost } from '../constant';

const URL = `${ApiHost}/todo`;

export const addTodoItem: TAddTodoItem = itemInfo =>
  axios.post(`${URL}/addTodoItem`, { itemInfo });

export const getTodoList: TGetTodoList = userId =>
  axios.get(`${URL}/getTodoList`, { params: { userId } });

export const finishItem: TFinishItem = todoId =>
  axios.get(`${URL}/finishItem`, { params: { todoId } });

export const recallItem: TFinishItem = todoId =>
  axios.get(`${URL}/recallTodo`, { params: { todoId } });

export const deleteItem: TFinishItem = todoId =>
  axios.get(`${URL}/deleteTodo`, { params: { todoId } });

export const clearAll: TClearAll = todoIds =>
  axios.post(`${URL}/clearAll`, { todoIds });

export const modifyItem: TModifyTodoItem = itemInfo =>
  axios.post(`${URL}/modify`, { ...itemInfo });

export const getCompleteList: TGetCompleteList = (userId, type) =>
  axios.get(`${URL}/alterEvent`, {
    params: {
      userId,
      type
    }
  });
