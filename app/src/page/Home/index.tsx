import React, { useEffect, useContext, useState, useCallback } from 'react';
import { getHome, getBlogList, getUndoList } from '../../api/home';
import { UserContext } from '../../store/users';
import Welcome from './Welcome';
import style from './style.module.scss';
import { useHistory } from 'react-router-dom';
import { Button, Collapse, Icon } from 'zent';
import { IBlogInfo, ITodoInfo } from '../../api/interface';

interface Props {}

const Home: React.FC<Props> = () => {
  const history = useHistory();

  const { state } = useContext(UserContext);

  const [curPage, setCurPage] = useState<number>(0);
  const [blogList, setBlogList] = useState<IBlogInfo[]>([]);
  const [undoList, setUndoList] = useState<ITodoInfo[]>([]);

  const [active, setActive] = useState<string | string[]>('map-0');
  const pageSize = 10;

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

  useEffect(() => {
    async function _getBlogList() {
      const { data } = await getBlogList(pageSize, curPage);
      const { blogList } = data.data;

      setBlogList(blogList);
    }

    _getBlogList();
  }, [curPage]);

  useEffect(() => {
    async function _getUndoList() {
      const { data } = await getUndoList(state.userId);
      const { undoList } = data.data;
      console.log(data);
      setUndoList(undoList);
    }

    _getUndoList();
  }, [state.userId]);

  const linkTodoList = () => {
    history.push('/todoList');
  };

  const linkToBlog = () => {
    history.push('/blog');
  };

  const handleColChange = (value: string | string[]) => {
    setActive(value);
  };

  const handlePanelChange = (key: string, isActive: boolean) => {
    console.log(key, isActive);
  };

  const renderUndoCard = useCallback(() => {
    return (
      <div className={style.undoCardWrap}>
        <Collapse
          activeKey={active}
          onChange={handleColChange}
          accordion
          panelTitleBackground="none"
        >
          {undoList &&
            undoList.map((elem, index) => (
              <Collapse.Panel
                title={elem.todoTitle}
                key={`map-${index}`}
                panelKey={`map-${index}`}
                onChange={handlePanelChange}
                showArrow={false}
              >
                <div>
                  <div className={style.cardTitle}>截止日期: </div>
                  <span
                    className={
                      new Date(elem.endTime) < new Date()
                        ? style.errorEvent
                        : style.warning
                    }
                  >
                    {elem.endTime}
                  </span>
                </div>
                <div>
                  <div className={style.cardTitle}>事项简介: </div>
                  <p className={style.itemBrief}>{elem.todoItem}</p>
                </div>
              </Collapse.Panel>
            ))}
        </Collapse>
        <div className={style.panelControl}>
          <span onClick={linkTodoList}>
            <Icon type="checkin-o" /> 前去处理
          </span>
        </div>
      </div>
    );
  }, [undoList, active]);

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

      <div className={style.contentList}>
        <div className={style.blogList}></div>
        <div className={style.left}>
          <div className={style.todoList}>
            <div className={style.itemTitle}>代办事项</div>
            {renderUndoCard()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
