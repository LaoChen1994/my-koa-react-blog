import Axios from "axios";
import {
  TUserLogin,
  TUserRegister,
  TCheckUsername,
  TGetUserDetail,
  TModifyAvatar,
  TUpdateAvatar,
  TUpdateUserInfo
} from "./interface";
import { ApiHost } from "../constant";

const URL = `${ApiHost}/user`;

export const userLogin: TUserLogin = (username, password) =>
  Axios.post(`${URL}/login`, { username, password }, { withCredentials: true });

export const userRegister: TUserRegister = (
  username,
  password,
  email,
  phoneNumber,
  avatarUrl
) =>
  Axios.post(`${URL}/register`, {
    username,
    password,
    email,
    phoneNumber,
    avatarUrl
  });

export const checkUser: TCheckUsername = username =>
  Axios.get(`${URL}/userValidate`, {
    params: {
      username
    }
  });

export const getUserDetail: TGetUserDetail = userId =>
  Axios.get(`${URL}/getUserInfo`, {
    params: {
      userId
    }
  });

export const modifyAvatarApi: TModifyAvatar = (data: FormData) =>
  Axios.post(`${URL}/modifyAvatar`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const updateAvatarApi: TUpdateAvatar = (userId, avatarUrl) =>
  Axios.post(`${URL}/updateUserAvatar`, { userId, avatarUrl });

export const updateUserInfo: TUpdateUserInfo = data =>
  Axios.post(`${URL}/updateUserInfo`, { ...data });
