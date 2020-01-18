import React, { ReactElement } from 'react';
import styles from './style.module.scss';
import { staticServer } from '../../constant';

interface Props {
  avatarUrl: string;
  name: string;
  time: string;
  extraRender?: () => React.ReactElement;
}

export default function index(props: Props): ReactElement {
  const { avatarUrl, name, time, extraRender } = props;

  return (
    <div className={styles.bottom}>
      <img
        src={`${staticServer}${avatarUrl}`}
        // alt="用户头像"
        className={styles.avatar}
      />
      <span className={styles.author}>{name}</span>
      <span className={styles.time}>发布日期: {time}</span>
      <div className={styles.extraBody}></div>
    </div>
  );
}
