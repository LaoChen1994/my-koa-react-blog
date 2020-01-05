import axios from 'axios';
import { ApiHost } from '../constant';
import { TGetUserTags, TAddBlog } from './interface';

const URL = `${ApiHost}/blog`;

export const getUserTags: TGetUserTags = userId =>
  axios.get(`${URL}/getUserTags`, {
    params: {
      userId
    }
  });

export const addBlog: TAddBlog = (userId, blogContent) =>
  axios.post(`${URL}/addBlog`, {
    userId,
    blogContent
  });
