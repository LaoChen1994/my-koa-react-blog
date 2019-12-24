import React from 'react';
import { UserProvider } from './store/users';
import Axios from 'axios';
import { Notify } from 'zent';
import 'zent/css/index.css';

import Index from './page/Router'

Axios.defaults.withCredentials = true;

Axios.interceptors.request.use(config => {
  const token = window.localStorage.getItem('userToken');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});

Axios.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    try {
      if (error.response.status === 401) {
        window.location.href = 'http://localhost:3000/#/login';
        localStorage.removeItem('userToken');
        Notify.error('用户不存在或用户认证失败!');
      }

      return error;
    } catch (error) {
      return error;
    }
  }
);

const App: React.FC = () => {
  // !window._global &&
  //   (window._global = {
  //     userInfo: {
  //       userId: '',
  //       username: '',
  //       email: '',
  //       isLogin: false,
  //       avatarUrl: ''
  //     }
  //   });

  return (
      <UserProvider>
        <Index />
      </UserProvider>
  );
};

export default App;
