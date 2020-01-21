import axios from "axios";
import { ApiHost } from "../constant";
import {
  TGetUserTags,
  TAddBlog,
  TGetBlogList,
  TGetBlogDetail,
  TModifyBlog,
  TAddComment,
  TGetCommentList
} from "./interface";

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

export const getBlogList: TGetBlogList = (pageSize, pageNumber, userId) => {
  return axios.get(`${URL}/getBlogList`, {
    params: { pageSize, pageNumber, userId }
  });
};

export const getBlogDetail: TGetBlogDetail = blogId =>
  axios.get(`${URL}/getBlogDetail`, { params: { blogId } });

export const modifyBlog: TModifyBlog = (
  blogId,
  blogName,
  blogContent,
  tagsId,
  userId
) =>
  axios.post(`${URL}/modifyBlog`, {
    blogId,
    blogName,
    blogContent,
    tagsId,
    userId
  });

export const addComment: TAddComment = (
  authorId,
  commentItem,
  belongId,
  belongText
) =>
  axios.post(`${URL}/addComment`, {
    authorId,
    commentItem,
    belongId,
    belongText
  });

export const getComment: TGetCommentList = (
  blogId,
  pageNumber = 1,
  pageSize = 5
) =>
  axios.get(`${URL}/getComments`, { params: { blogId, pageSize, pageNumber } });
