import React, { useContext, useCallback, useEffect, useState } from 'react';
import styles from './style.module.scss';
import {
  DragStore,
  DragWrapper,
  DragElement
} from '../../component/DragComponent';
import { Button, Dialog, Tag } from 'zent';
import { AddTodoForm } from './AddTodoForm';
import { UserContext } from '../../store/users';
import { getTodoList } from '../../api/todo';
import { ITodoInfo } from '../../api/interface';
import { MyCard, ICardProps, TCardSlidUp } from '../../component/MyCard';

interface Props {}

export const TodoList: React.FC<Props> = () => {
  const { state } = useContext(UserContext);
  const { userId } = state;
  const [todoList, setTodoList] = useState<ITodoInfo[]>([]);

  const openAddDialog = useCallback(() => {
    const { openDialog, closeDialog } = Dialog;

    const close = () => {
      closeDialog('addTodoDialog');
    };

    openDialog({
      dialogId: 'addTodoDialog',
      title: '添加代办事项',
      children: <AddTodoForm userId={userId} closeDialog={close}></AddTodoForm>,
      style: { width: '50%' }
    });
  }, [state]);

  useEffect(() => {
    async function getTodo() {
      const { data } = await getTodoList(userId);
      const { data: todoList = [] } = data.data;
      setTodoList(todoList);
    }
    getTodo();
  }, [userId]);

  const cardToggle: ICardProps['cardToggle'] = (isShow, toggle) => {
    if (!isShow) {
      toggle();
    }
  };

  const noteRender = (info: ITodoInfo) => () => {
    const { todoId, isComplete, todoItem } = info;
    return (
      <div className={styles.noteWrapper}>
        <span className={styles.noteId}>ID: {todoId}</span>
        <span className={styles.noteTitle}>
          <div>{todoItem}</div>
        </span>
        <div className={styles.tag}>
          <Tag theme={isComplete ? 'green' : 'red'} outline>
            {isComplete ? '已完成' : '未完成'}
          </Tag>
        </div>
      </div>
    );
  };

  const contentRender = (info: ITodoInfo, slideUp: TCardSlidUp) => () => {
    const { todoItem } = info;

    return (
      <div className={styles.todoCon}>
        <div className={styles.content}>
          <div className={styles.detail}>
            <div className={styles.subtitle}>事件详情:</div>
            <div className={styles.detailContent}>{todoItem}</div>
          </div>
          <div className={styles.subController}>
            <Button
              type="success"
              onClick={slideUp}
            >
              完成
            </Button>
            <Button type="error" outline>
              取消
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <DragStore>
        <DragWrapper className={styles.drageWrapper}>
          <div className={styles.title}>Todo</div>
          {todoList.map((elem, index) => (
            <DragElement key={`todoItem-${index}`}>
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
                {({ slideUp }: { slideUp: TCardSlidUp }) =>
                  contentRender(elem, slideUp)()
                }
              </MyCard>
            </DragElement>
          ))}

          <div className={styles.controller}>
            <Button type="primary" size="medium" onClick={openAddDialog}>
              添加任务
            </Button>
            <Button type="danger" outline size="medium">
              清空任务
            </Button>
          </div>
        </DragWrapper>

        <DragWrapper className={styles.drageWrapper}>
          <div className={styles.title}>Finished</div>
          <DragElement>
            <div>456789</div>
          </DragElement>
        </DragWrapper>
      </DragStore>
    </div>
  );
};
