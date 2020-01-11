import axios from 'axios';
import { ApiHost } from '../constant';
import {
  TGetUserTags,
  TAddBlog,
  TGetBlogList,
  TGetBlogDetail
} from './interface';

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

export const getBlogList: TGetBlogList = (pageSize, pageNumber) =>
  axios.get(`${URL}/getBlogList`, {
    params: { pageSize, pageNumber }
  });

export const getBlogDetail: TGetBlogDetail = blogId =>
  axios.get(`${URL}/getBlogDetail`, { params: { blogId } });
