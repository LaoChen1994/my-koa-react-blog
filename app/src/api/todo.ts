import { TAddTodoItem, TGetTodoList } from './interface';
import axios from 'axios';
import { ApiHost } from '../constant';

export const addTodoItem: TAddTodoItem = itemInfo =>
  axios.post(`${ApiHost}/todo/addTodoItem`, { itemInfo });

export const getTodoList: TGetTodoList = userId =>
  axios.get(`${ApiHost}/todo/getTodoList`, { params: { userId } });
