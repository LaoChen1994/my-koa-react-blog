import Axios from 'axios';
import {
  TUserLogin,
  TUserRegister,
  TCheckUsername,
  TGetUserDetail
} from './interface';
import { ApiHost } from '../constant';

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
