import React, { useContext, useEffect } from 'react';
import { ITodoInfo } from '../../api/interface';
import { TCardSlidUp } from '../../component/MyCard';
import styles from './style.module.scss';
import { UserContext } from '../../store/users';

import { finishItem, recallItem, deleteItem } from '../../api/todo';
import { Notify, Button, Dialog } from 'zent';
import { AddTodoForm, IAddTodoProps } from './AddTodoForm';

interface Props {
  info: ITodoInfo;
  slideUp: TCardSlidUp;
  setUpdate: React.Dispatch<React.SetStateAction<number>>;
  upd: number;
}

export const CardContent: React.FC<Props> = props => {
  const { info, slideUp, setUpdate, upd } = props;
  const { todoItem, todoId, isComplete, startTime, endTime } = info;

  const { openDialog, closeDialog } = Dialog;

  const changeItem = (type: 'recal' | 'finish', todoId: number) => async () => {
    const { data } =
      type === 'recal' ? await recallItem(todoId) : await finishItem(todoId);
    if (data.status) {
      Notify.success(data.msg);
      setUpdate(upd + 1);
      slideUp();
    } else {
      Notify.error(data.msg);
    }
  };

  const deleteTodo = async () => {
    const { data } = await deleteItem(todoId);
    if (data.status) {
      Notify.success(data.msg);
      setUpdate(upd + 1);
    } else {
      Notify.error(data.msg);
    }
  };

  const handleFix = async () => {
    const close = () => {
      closeDialog('modifyForm');
      setUpdate(upd + 1);
    };

    const defaultValue: IAddTodoProps['defaultValue'] = {
      todoTitle: info.todoTitle,
      todoItem: info.todoItem,
      startTime: info.startTime,
      endTime: info.endTime
    }

    openDialog({
      dialogId: 'modifyForm',
      title: '修改代办事项',
      style: { width: '50%' },
      children: (
        <AddTodoForm
          todoId={info.todoId}
          closeDialog={close}
          type="update"
          defaultValue={defaultValue}
        ></AddTodoForm>
      )
    });
  };

  return (
    <div className={styles.todoCon}>
      <div className={styles.content}>
        <div className={styles.detail}>
          <div className={styles.subtitle}>事件详情:</div>
          <div className={styles.detailContent}>{todoItem}</div>
        </div>
        <div className={styles.detail}>
          <div className={styles.subtitle}>日程安排:</div>
          <div className={styles.detailContent}>起始时间: {startTime}</div>
          <div className={styles.detailContent}>结束事件: {endTime}</div>
        </div>
        <div className={styles.subController}>
          {isComplete ? (
            <>
              <Button
                type="danger"
                outline
                onClick={changeItem('recal', todoId)}
              >
                撤回
              </Button>
            </>
          ) : (
            <>
              <Button type="primary" outline onClick={handleFix}>
                修改
              </Button>
              <Button type="success" onClick={changeItem('finish', todoId)}>
                完成
              </Button>
              <Button type="error" outline onClick={deleteTodo}>
                删除
              </Button>
            </>
          )}
          <Button type="secondary" onClick={() => slideUp()}>
            收起
          </Button>
        </div>
      </div>
    </div>
  );
};
