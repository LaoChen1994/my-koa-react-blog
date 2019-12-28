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
import { addTodoItem } from '../../api/todo';
import { IAddTodoFormProps } from './interface';

interface Props {
  userId: number;
  closeDialog: () => void;
}

export const AddTodoForm: React.FC<Props> = props => {
  const form = Form.useForm(FormStrategy.View);
  const { userId, closeDialog } = props;

  const handleSubnmit = async () => {
    const {
      todoItem,
      timeRange,
      todoTitle
      //@ts-ignore
    } = form.getValue() as IAddTodoFormProps;

    const { data } = await addTodoItem({
      userId: userId,
      todoItem,
      startTime: timeRange[0],
      endTime: timeRange[1],
      todoTitle,
      isComplete: false
    });

    if (data.status) {
      Notify.success(data.msg);
      closeDialog();
    } else {
      Notify.error(data.msg);
    }
  };

  return (
    <Form form={form} layout="horizontal">
      <FormInputField
        name="todoItem"
        label="代办事项名称"
        required
        validators={[Validators.required('代办事项名称必填!')]}
      ></FormInputField>
      <FormDateRangePickerField
        name="timeRange"
        label="起始结束时间"
        required
        validators={[Validators.required('请选择有效时间区间')]}
      ></FormDateRangePickerField>
      <FormInputField
        name="todoTitle"
        label="代办详情"
        props={{ type: 'textarea' }}
      ></FormInputField>
      <div className={styles.formController}>
        <Button type="primary" onClick={handleSubnmit}>
          添加
        </Button>
        <Button type="danger" outline onClick={() => form.resetValue()}>
          重置
        </Button>
      </div>
    </Form>
  );
};
