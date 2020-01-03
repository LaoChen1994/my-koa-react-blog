import axios from 'axios';
import { ApiHost } from '../constant';
import { TValidateUser, TGetTodoList, TGetBlogList, TGetUndoList } from './interface';

const URL = `${ApiHost}/home`;

export const getHome: TValidateUser = () => axios.get(`${URL}/list`);
export const getUndoList: TGetUndoList = userId =>
  axios.get(`${URL}/getUndoList`, {
    params: {
      userId
    }
  });

export const getBlogList: TGetBlogList = (pageSize, pageNumber) =>
  axios.get(`${URL}/getNewBlogList`, { params: { pageSize, pageNumber } });
