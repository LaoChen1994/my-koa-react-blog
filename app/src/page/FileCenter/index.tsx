import React from 'react';
import styles from './style.module.scss';
interface Props {}

export const FileCenter: React.FC<Props> = () => {
  return (
    <div>
      <div className={styles.uploadBtn}></div>
      <div className={styles.fileList}></div>
    </div>
  );
};
