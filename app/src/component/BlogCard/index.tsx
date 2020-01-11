import React from 'react';
import { TBlogBrief } from '../../api/interface';
import styles from './style.module.scss';
import { useHistory } from 'react-router-dom';
import { staticServer } from '../../constant';

interface Props {
  data: TBlogBrief;
}

export const BlogCard: React.FC<Props> = props => {
  const { data, ...res } = props;
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

  return (
    <div className={styles.wrapper} onClick={handleClick} {...res}>
      <div className={styles.title}>{blogName}</div>
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
