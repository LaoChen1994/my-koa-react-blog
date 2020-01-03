import React from 'react';
import { Writer } from './Writer';
import 'braft-editor/dist/index.css';
import styles from './style.module.scss';
import { FormInputField, Button } from 'zent';

interface Props {}

const index: React.FC<Props> = (props) => {

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}></div>
      <div>
        <Writer></Writer>
      </div>
      <div className={styles.controller}>
        <Button type="primary" outline>提交文章</Button>
      </div>
    </div>
  );
};

export default index;
