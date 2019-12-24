import React, { useEffect, useState } from 'react';
import styles from './style.module.scss';
import { Header } from '../../component/Header';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import Login from '../../page/Login';
import Home from '../../page/Home';
import { Register } from '../../page/Register';
import { TodoList } from '../../page/Todo'

import { getHome } from '../../api/home';
import { initUserInfo } from '../../constant';
import { IUserState } from '../../interface';


const RouterPage: React.FC = () => {
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

  const [userInfo, setUserInfo] = useState<IUserState>(initUserInfo);

  useEffect(() => {
    const token = localStorage.getItem('userToken');

    async function userValidate() {
      const { data } = await getHome();
      if (data && data.status) {
        setUserInfo({ ...data.userInfo, isLogin: true });
      }
    }
    if (token) {
      userValidate();
    }
  }, []);

  return (
    <div className={styles.App}>
      <Router>
        <Header userInfo={userInfo}></Header>
        <Switch>
          <Route exact path="/Login">
            <Login></Login>
          </Route>
          <Route exact path="/home">
            <Home></Home>
          </Route>
          <Route exact path="/register">
            <Register></Register>
          </Route>
          <Route exact path="/todoList">
            <TodoList></TodoList>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default RouterPage;
