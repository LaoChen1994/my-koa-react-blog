import React, { useEffect, useState, useContext } from 'react';
import {
  Route,
  Switch,
  useRouteMatch,
  Link,
  withRouter,
  RouteComponentProps
} from 'react-router-dom';
import { WriteBlog } from '../WriteBlog';
import { Icon } from 'zent';
import { ArticlePanel } from '../ArticlePanel';
import { MyBlogList } from '../MyBlogList';
import { UserContext } from '../../store/users';

import styles from './style.module.scss';

interface Props {}

const CBlog = (props: Props & RouteComponentProps) => {
  const { url, path } = useRouteMatch();
  const [showTab, setTabStatus] = useState<boolean>(true);
  const { history, location } = props;
  const { state } = useContext(UserContext);
  const { userId } = state;

  useEffect(() => {
    const regx = /(?<=\/blog\/)[a-zA-Z]+.*/gi;
    const isShow = !regx.test(location.pathname);
    setTabStatus(isShow);

    if (isShow) {
      const idReg = /(?<=\/blog\/)\d+/;
      if (!idReg.test(location.pathname)) {
        userId && ~userId
          ? history.push(`${url}/${userId}`)
          : history.push('/');
      }
      return;
    }

    history.listen(data => {
      const { pathname } = data;
      console.log(pathname)
      setTabStatus(!regx.test(pathname));
    });
  }, [location.pathname]);

  return (
    <div className={styles.wrapper}>
      <div className={showTab ? styles.blogTabber : styles.hidden}>
        <Link to={`/`}>博客主页</Link>
        <Link to={`${url}/blogEdit`}>
          <Icon type="edit-o"></Icon> 写博客
        </Link>
      </div>
      <Switch>
        <Route path={`${path}/artical/:blogId`}>
          <ArticlePanel></ArticlePanel>
        </Route>
        <Route path={`${path}/blogEdit`} exact>
          <WriteBlog></WriteBlog>
        </Route>
        <Route path={`${path}/blogEdit/:blogId`}>
          <WriteBlog></WriteBlog>
        </Route>
        <Route path={`${path}/:userId`} exact>
          <MyBlogList></MyBlogList>
        </Route>
      </Switch>
    </div>
  );
};

export const Blog = withRouter(CBlog);
