import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../store/users';
import styles from './style.module.scss';
import { Header } from '../../component/Header';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import Login from '../../page/Login';
import Home from '../../page/Home';
import { Register } from '../../page/Register';
import { TodoList } from '../../page/Todo';
import NotFound from '../NotFound';
import { Blog } from '../Blog';

import { getHome } from '../../api/home';
import { initUserInfo } from '../../constant';
import { IUserState } from '../../interface';
import { FileCenter } from '../FileCenter';
import { SwitchHeader } from '../../store/SwitchHeader';


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
  const { state } = useContext(UserContext);

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
          <Redirect
            path="/"
            exact
            to={state.isLogin ? '/home' : '/Login'}
          ></Redirect>
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
          <Route path="/blog">
            <Blog></Blog>
          </Route>
          <Route path="/fileCenter">
            <FileCenter></FileCenter>
          </Route>
          <Route exact path="/404">
            <NotFound></NotFound>
          </Route>
          <Redirect path="/" to="/404"></Redirect>
        </Switch>
      </Router>
    </div>
  );
};

export default RouterPage;
