import Axios from 'axios';
import { TUserLogin, TUserRegister, TCheckUsername } from './interface';
import { ApiHost } from '../constant';

export const userLogin: TUserLogin = (username, password) =>
  Axios.post(
    `${ApiHost}/user/login`,
    { username, password },
    { withCredentials: true }
  );

export const userRegister: TUserRegister = (
  username,
  password,
  email,
  phoneNumber,
  avatarUrl
) =>
  Axios.post(`${ApiHost}/user/register`, {
    username,
    password,
    email,
    phoneNumber,
    avatarUrl
  });

export const checkUser: TCheckUsername = username =>
  Axios.get(`${ApiHost}/user/userValidate`, {
    params: {
      username
    }
  });
