import React from 'react';
import {
  Form,
  FormInputField,
  FormStrategy,
  FormDateRangePickerField,
  Validators,
  Button,
  Notify
} from 'zent';

import styles from './style.module.scss';
import { addTodoItem, modifyItem } from '../../api/todo';
import { IAddTodoFormProps } from './interface';
import { ITodoInfo } from '../../api/interface';

export interface IAddTodoProps {
  userId?: number;
  todoId?: number;
  closeDialog: () => void;
  callback?: () => void;
  defaultValue?: Pick<
    ITodoInfo,
    'todoTitle' | 'todoItem' | 'startTime' | 'endTime'
  >;
  type: 'add' | 'update';
}

export const AddTodoForm: React.FC<IAddTodoProps> = props => {
  const form = Form.useForm(FormStrategy.View);
  const { userId = -1, closeDialog, callback, type, defaultValue, todoId = -1 } = props;

  const handleSubnmit = async () => {
    const {
      todoItem,
      timeRange,
      todoTitle
      //@ts-ignore
    } = form.getValue() as IAddTodoFormProps;

    const { data = { status: '', msg: '' } } =
      type === 'add'
        ? await addTodoItem({
            userId: userId,
            todoItem,
            startTime: timeRange[0],
            endTime: timeRange[1],
            todoTitle,
            isComplete: false
          })
        : await modifyItem({
            todoId,
            todoItem,
            startTime: timeRange[0],
            endTime: timeRange[1],
            todoTitle,
            isComplete: false
          });

    if (data.status) {
      Notify.success(data.msg);
      closeDialog();
      console.log('update', callback);
      callback && callback();
    } else {
      Notify.error(data.msg);
    }
  };

  return (
    <Form form={form} layout="horizontal">
      <FormInputField
        name="todoTitle"
        label="代办事项名称"
        required
        validators={[Validators.required('代办事项名称必填!')]}
        defaultValue={defaultValue && defaultValue.todoTitle}
      ></FormInputField>
      <FormDateRangePickerField
        name="timeRange"
        label="起始结束时间"
        required
        validators={[Validators.required('请选择有效时间区间')]}
        defaultValue={
          defaultValue && [defaultValue.startTime, defaultValue.endTime]
        }
      ></FormDateRangePickerField>
      <FormInputField
        name="todoItem"
        label="代办详情"
        props={{ type: 'textarea', width: '60%' }}
        defaultValue={defaultValue && defaultValue.todoItem}
      ></FormInputField>
      <div className={styles.formController}>
        <Button type="primary" onClick={handleSubnmit}>
          {type === 'add' ? '添加' : '修改'}
        </Button>
        <Button type="danger" outline onClick={() => form.resetValue()}>
          重置
        </Button>
      </div>
    </Form>
  );
};
