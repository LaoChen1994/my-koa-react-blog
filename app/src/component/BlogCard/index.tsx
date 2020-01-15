import React from 'react';
import { TBlogBrief } from '../../api/interface';
import styles from './style.module.scss';
import { useHistory } from 'react-router-dom';
import { staticServer } from '../../constant';
import { Button } from 'zent';
import cx from 'classnames';

interface Props {
  data: TBlogBrief;
  isEditable?: boolean;
}

export const BlogCard: React.FC<Props> = props => {
  const { data, isEditable, ...res } = props;
  const {
    userName,
    lastUpdateTime,
    blogId,
    blogName,
    blogContent,
    avatarUrl
  } = data;
  const history = useHistory();

  const handleClick = () => {
    history.push(`/blog/artical/${blogId}`);
  };

  const handleEdit = () => {
    history.push(`/blog/blogEdit/${blogId}`);
  };

  return (
    <div
      className={cx({
        [styles.wrapper]: true,
        [styles.cursorPointer]: !isEditable
      })}
      {...(!isEditable && { onClick: handleClick })}
      {...res}
    >
      <div className={styles.title}>
        <div className={styles.titleText}>{blogName}</div>
        <div
          className={styles.controller}
          style={{ display: isEditable ? 'block' : 'none' }}
        >
          <Button type="primary" onClick={handleEdit}>编辑</Button>
          <Button type="success" outline onClick={handleClick}>
            查看
          </Button>
        </div>
      </div>
      <p
        className={styles.brief}
        dangerouslySetInnerHTML={{ __html: blogContent }}
      ></p>
      <div className={styles.bottom}>
        <img
          src={`${staticServer}${avatarUrl}`}
          alt="用户头像"
          className={styles.avatar}
        />
        <span className={styles.author}>{userName}</span>
        <span className={styles.time}>{lastUpdateTime}</span>
      </div>
    </div>
  );
};
