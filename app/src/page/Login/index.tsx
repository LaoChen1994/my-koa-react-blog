import React, { useContext, useEffect } from 'react';
import { UserContext } from '../../store/users';
import styles from './style.module.scss';
import {
  Form,
  FormInputField,
  FormStrategy,
  Validators,
  Button,
  Notify
} from 'zent';
import { useHistory } from 'react-router-dom';

import { userLogin } from '../../api/user';

const Login: React.FC<{}> = () => {
  const { state, dispatch } = useContext(UserContext);
  const form = Form.useForm(FormStrategy.View);
  const history = useHistory();

  const handleLogin = async () => {
    const { username, password } = form.getValue() as {
      username: string;
      password: string;
    };
    const { data } = await userLogin(username, password);
    if (data && data.status) {
      const { token, userInfo } = data;

      // 使用state会更安全
      // window._global && (window._global.userInfo = userInfo);

      dispatch({ type: 'login', payload: { ...userInfo, isLogin: true } });

      window.localStorage.setItem('userToken', token);
      history.push('/home');
    } else {
      Notify.error(data.msg);
    }
  };

  const handleReset = () => {
    form.resetValue();
  };

  useEffect(() => {
    const token = window.localStorage.getItem('userToken');
    if (token) {
      if (state && state.isLogin) {
        history.push('/home');
      }
    } else {
      dispatch({ type: 'logout' });
    }
  }, []);

  return (
    <div className={styles.panel}>
      <h1>Login</h1>
      <Form form={form} layout="horizontal" className={styles.form}>
        <FormInputField
          name="username"
          label="用户名"
          validators={[Validators.required('请输入用户名')]}
          required
        ></FormInputField>
        <FormInputField
          name="password"
          label="密码"
          validators={[Validators.required('请输入密码')]}
          required
          props={{
            type: 'password'
          }}
        ></FormInputField>
        <div className={styles.controller}>
          <Button onClick={handleLogin} type="primary">
            登录
          </Button>
          <Button onClick={handleReset} type="danger" outline>
            重置
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Login;
