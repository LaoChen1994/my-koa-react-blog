import React, { useContext, useEffect } from 'react';
import styles from './style.module.scss';
import { UserContext } from '../../store/users';
import { Button, Popover } from 'zent';
import { useHistory } from 'react-router-dom';
import { IUserState } from '../../store/interface';

import { LinkCreator } from '../../constant';

interface Props {
  userInfo?: IUserState;
}

export const Header: React.FC<Props> = props => {
  const { state, dispatch } = useContext(UserContext);
  const { userInfo } = props;
  const history = useHistory();

  const renderLogout = () => {
    return (
      <div className={styles.controller}>
        <Button type="primary" onClick={() => history.push('/register')}>
          注册
        </Button>
        <Button type="danger" outline onClick={() => history.push('/login')}>
          登录
        </Button>
      </div>
    );
  };

  const renderHoverList = () => {
    const userLink = new LinkCreator('用户Link')
      .addLinkPage(['userCenter', 'todoList', 'blog', 'logout'])
      .getLinkList();

    const handleClick = (param: string | (() => void) | null) => () => {
      if (param) {
        if (typeof param === 'function') {
          param();
        } else {
          history.push(param);
        }
      }
    };

    return (
      <div className={styles.hover}>
        {userLink.map((elem, index) => (
          <div
            className={styles.hoverItem}
            key={`userHoverItem-${index}`}
            onClick={handleClick(
              elem.link ? elem.link : elem.callback ? elem.callback : null
            )}
          >
            {elem.title}
          </div>
        ))}
      </div>
    );
  };

  const renderLogin = () => {
    const { avatarUrl } = state;

    const handleLogout = () => {
      dispatch({ type: 'logout' });
      localStorage.removeItem('userToken');
      history.push('/login');
    };

    return (
      <div className={styles.userTabel}>
        <Popover position={Popover.Position.BottomCenter} cushion={20}>
          <Popover.Trigger.Hover>
            <img
              src={
                `http://127.0.0.1:8000${avatarUrl}` ||
                require('../../static/image/user.jpeg')
              }
              alt="用户头像"
              className={styles.userAvatar}
            />
          </Popover.Trigger.Hover>
          <Popover.Content>{renderHoverList()}</Popover.Content>
        </Popover>

        <Button
          type="danger"
          outline
          className={styles.btn}
          onClick={handleLogout}
        >
          登出
        </Button>
      </div>
    );
  };

  useEffect(() => {
    userInfo && dispatch({ type: 'login', payload: userInfo });
  }, [userInfo, dispatch]);

  const linkToHome = () => {
    history.push('/home')
  }

  return (
    <div className={styles.header}>
      <div className={styles.body}>
        <img
          src={require('../../static/image/logo.png')}
          alt="logo"
          className={styles.avatar}
          onClick={linkToHome}
        />
        <div className={styles.content}>
          {state.isLogin ? renderLogin() : renderLogout()}
        </div>
      </div>
    </div>
  );
};
