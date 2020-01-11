import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { getBlogDetail } from '../../api/blog';
import styles from './style.module.scss';
import { FullScreenLoading, Tag } from 'zent';
import { TBlogDetailInfo } from '../../api/interface';
import { staticServer } from '../../constant';
import cx from 'classnames';

interface Props {}

export const ArticlePanel: React.FC<Props> = () => {
  const routerMatch = useRouteMatch<{ blogId: string }>();
  const { blogId } = routerMatch.params;
  const [isLoad, setLoad] = useState<boolean>(false);
  const [article, setArticle] = useState<TBlogDetailInfo>(
    {} as TBlogDetailInfo
  );
  console.log(article);

  useEffect(() => {
    setLoad(true);
    async function getDetail() {
      const data = await getBlogDetail(+blogId);
      setLoad(false);
      setArticle(data.data.data);
    }

    getDetail();
  }, [blogId]);

  return (
    <>
      <FullScreenLoading loading={isLoad} icon="circle"></FullScreenLoading>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1>{article.blogName}</h1>
          <div
            className={cx({
              [styles.authorInfo]: true,
              [styles.bottomSplit]: true
            })}
            style={{marginTop: '10px'}}
          >
            <span className={styles.time}>{article.lastUpdateTime}</span>
            {article.tags &&
              article.tags.map((elem, index) => (
                <Tag
                  style={{ marginLeft: '10px' }}
                  key={`tags-${index}`}
                  outline
                  theme="green"
                >
                  {elem.tagName}
                </Tag>
              ))}
          </div>
        </div>
        <div className={styles.content}>
          <div
            className={styles.text}
            dangerouslySetInnerHTML={{ __html: article.blogContent }}
          ></div>
        </div>
        <div
          className={cx({ [styles.authorInfo]: true, [styles.topSplit]: true })}
        >
          <div className={styles.left}>
            <img
              src={`${staticServer}${article.avatarUrl}`}
              alt="作者头像"
              className={styles.userIcon}
            />
          </div>
          <div className={styles.right}>
            <div className={styles.username}>{article.username}</div>
            <div
              className={cx({
                [styles.additionInfo]: true
              })}
            >
              博客数：{article.blogNumber}
            </div>
          </div>
        </div>
        <div className={styles.comment}></div>
      </div>
    </>
  );
};
