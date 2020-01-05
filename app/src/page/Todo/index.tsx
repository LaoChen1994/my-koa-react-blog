import React, { useContext, useCallback, useEffect, useState } from 'react';
import styles from './style.module.scss';
import {
  DragStore,
  DragWrapper,
  DragElement
} from '../../component/DragComponent';
import { Button, Dialog, Tag, Notify } from 'zent';
import { AddTodoForm } from './AddTodoForm';
import { CardContent } from './CardContent';

import { UserContext } from '../../store/users';
import {
  getTodoList,
  finishItem,
  recallItem,
  clearAll,
  getCompleteList
} from '../../api/todo';
import { ITodoInfo } from '../../api/interface';
import { MyCard, ICardProps, TCardSlidUp } from '../../component/MyCard';

interface Props {}

export const TodoList: React.FC<Props> = () => {
  const { state } = useContext(UserContext);
  const { userId } = state;
  const [_upd, setUpd] = useState<number>(0);

  const [solvedList, setSolved] = useState<ITodoInfo[]>([]);
  const [unsolvedList, setUnsolved] = useState<ITodoInfo[]>([]);
  const [dropItemId, setDropItemId] = useState<number>(-1);

  const [isHistory, setIsHis] = useState<boolean>(false);

  const openAddDialog = useCallback(() => {
    const { openDialog, closeDialog } = Dialog;

    const close = () => {
      closeDialog('addTodoDialog');
    };

    openDialog({
      dialogId: 'addTodoDialog',
      title: '添加代办事项',
      children: (
        <AddTodoForm
          userId={userId}
          closeDialog={close}
          callback={() => {
            setUpd(_upd + 1);
          }}
          type="add"
        ></AddTodoForm>
      ),
      style: { width: '50%' }
    });
  }, [state]);

  useEffect(() => {
    async function getTodo() {
      if (userId && userId !== -1) {
        const { data } = await getTodoList(userId);
        const { data: todoList = [] } = data.data;

        const solvedList = todoList.filter(elem => elem.isComplete);
        const unsolvedList = todoList.filter(elem => !elem.isComplete);

        setUnsolved(unsolvedList);
        setSolved(solvedList);
      }
    }
    getTodo();
  }, [userId, _upd]);

  const cardToggle: ICardProps['cardToggle'] = (isShow, toggle) => {
    if (!isShow) {
      toggle();
    }
  };

  const noteRender = (info: ITodoInfo) => () => {
    const { todoId, isComplete, todoItem, isExpire, endTime } = info;

    const workExpire = new Date(endTime) < new Date();

    return (
      <div className={styles.noteWrapper}>
        <span className={styles.noteId}>ID: {todoId}</span>
        <span className={styles.noteTitle}>
          <div>{todoItem}</div>
        </span>
        <div className={styles.tag}>
          <Tag
            theme={isComplete ? 'green' : 'red'}
            outline
            style={{ marginRight: '10px' }}
          >
            {isComplete ? '已完成' : '未完成'}
          </Tag>
          {isComplete ? (
            isExpire ? (
              <Tag theme="green" outline>
                按时完成
              </Tag>
            ) : (
              <Tag theme="yellow" outline>
                延期完成
              </Tag>
            )
          ) : workExpire ? (
            <Tag theme="red">延期中</Tag>
          ) : null}
        </div>
      </div>
    );
  };

  const handleElemDrop = (setStatus: boolean) => async () => {
    const { data } = setStatus
      ? await finishItem(dropItemId)
      : await recallItem(dropItemId);
    if (data && data.status) {
      Notify.success(`${data.msg}，请刷新查看任务状态`);
      window.location.reload();
    } else {
      Notify.error(`${data.msg}, 请重试`);
    }
  };

  const deleteAll = async () => {
    const todoIds = unsolvedList.map(elem => elem.todoId);
    const { data } = await clearAll(todoIds);

    if (data.status) {
      setUnsolved([]);
    }
  };

  const alterEvent = useCallback(async () => {
    const { data } = await getCompleteList(state.userId, isHistory);
    const { data: completeList } = data;

    setSolved(completeList);
    setIsHis(!isHistory);
  }, [isHistory, state]);

  return (
    <div className={styles.wrapper}>
      <DragStore>
        <div className={styles.drageWrapper}>
          <div className={styles.title}>Todo</div>
          <DragWrapper
            useStyle="custom"
            className={styles.todoContent}
            dropCallback={handleElemDrop(false)}
          >
            {unsolvedList.map((elem, index) => (
              <DragElement
                key={`todoItem-${index}`}
                onDragStart={() => {
                  setDropItemId(elem.todoId);
                }}
              >
                {/* 
                //@ts-ignore */}
                <MyCard
                  title={elem.todoTitle}
                  trigger="click"
                  noteRender={noteRender(elem)}
                  // @ts-ignore
                  style={{ margin: '10px auto' }}
                  cardToggle={cardToggle}
                >
                  {({ slideUp }: { slideUp: TCardSlidUp }) => (
                    <CardContent
                      slideUp={slideUp}
                      upd={_upd}
                      setUpdate={setUpd}
                      info={elem}
                    ></CardContent>
                  )}
                </MyCard>
              </DragElement>
            ))}
          </DragWrapper>

          <div className={styles.controller}>
            <Button type="primary" size="medium" onClick={openAddDialog}>
              添加任务
            </Button>
            <Button type="danger" outline size="medium" onClick={deleteAll}>
              清空任务
            </Button>
          </div>
        </div>

        <div className={styles.drageWrapper}>
          <div className={styles.title}>Finished</div>
          <DragWrapper
            useStyle="custom"
            className={styles.todoContent}
            dropCallback={handleElemDrop(true)}
          >
            {solvedList.map((elem, index) => (
              <DragElement
                key={`todoItem-${index}`}
                onDragStart={() => {
                  setDropItemId(elem.todoId);
                }}
              >
                {/* 
                //@ts-ignore */}
                <MyCard
                  title={elem.todoTitle}
                  trigger="click"
                  noteRender={noteRender(elem)}
                  // @ts-ignore
                  style={{ margin: '10px auto' }}
                  cardToggle={cardToggle}
                >
                  {({ slideUp }: { slideUp: TCardSlidUp }) => (
                    <CardContent
                      slideUp={slideUp}
                      upd={_upd}
                      setUpdate={setUpd}
                      info={elem}
                    ></CardContent>
                  )}
                </MyCard>
              </DragElement>
            ))}
          </DragWrapper>

          <div className={styles.controller}>
            <div>
              <span className={styles.static}>总计:</span>
              <span className={styles.staticText}>{solvedList.length}</span>
            </div>

            <Button type="primary" outline size="medium" onClick={alterEvent}>
              {!isHistory ? '今日完成列表' : '历史完成列表'}
            </Button>
          </div>
        </div>
      </DragStore>
    </div>
  );
};
