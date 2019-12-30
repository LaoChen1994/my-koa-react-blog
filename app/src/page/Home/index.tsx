import React, { useEffect, useContext } from 'react';
import { getHome } from '../../api/home';
import { UserContext } from '../../store/users';
import Welcome from './Welcome';
import style from './style.module.scss';
import { useHistory } from 'react-router-dom';
import { Button } from 'zent';

interface Props {}

const Home: React.FC<Props> = () => {
  const { state } = useContext(UserContext);
  const history = useHistory();

  useEffect(() => {
    async function getData() {
      await getHome();
    }

    try {
      getData();
    } catch (error) {
      console.log('err=', error);
    }
  }, []);

  const linkTodoList = () => {
    history.push('/todoList');
  };

  const linkToBlog = () => {
    history.push('/blog');
  };

  return (
    <div className={style.show}>
      <div className={style.banner}>
        <Welcome></Welcome>
      </div>
      <div className={style.controller}>
        <Button type="primary" size="large" onClick={linkTodoList}>
          计划安排
        </Button>
        <Button
          type="success"
          outline
          size="large"
          style={{ marginLeft: '30px' }}
          onClick={linkToBlog}
        >
          我的博客
        </Button>
      </div>
    </div>
  );
};

export default Home;
