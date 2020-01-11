import React, { useEffect, useState } from 'react';
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

import styles from './style.module.scss';

interface Props {}

const CBlog = (props: Props & RouteComponentProps) => {
  const { url, path } = useRouteMatch();
  const [showTab, setTabStatus] = useState<boolean>(true);
  const { history, location } = props;

  useEffect(() => {
    const regx = /\/blog\/(\w+).*/ig;
    const isShow = regx.test(location.pathname);
    setTabStatus(!isShow);

    history.listen(data => {
      const { pathname } = data;
      setTabStatus(!regx.test(pathname));
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={showTab ? styles.blogTabber : styles.hidden}>
        <Link to='/'>博客主页</Link>
        <Link to={`${url}/blogEdit`}><Icon type="edit-o"></Icon> 写博客</Link>
      </div>
      <Switch>
        <Route path={path} exact>
          HOME
        </Route>
        <Route path={`${path}/artical/:blogId`}>
          <ArticlePanel></ArticlePanel>
        </Route>
        <Route path={`${path}/blogEdit`}>
          <WriteBlog></WriteBlog>
        </Route>
      </Switch>
    </div>
  );
};

export const Blog = withRouter(CBlog);
