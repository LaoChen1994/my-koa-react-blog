import React, { useEffect, useState, useContext, useCallback } from "react";
import { UserContext } from "../../store/users";
import { useRouteMatch } from "react-router-dom";
import { getBlogDetail, addComment, getComment } from "../../api/blog";
import styles from "./style.module.scss";
import { FullScreenLoading, Tag } from "zent";
import { TBlogDetailInfo, IUserDetail, TCommentType } from "../../api/interface";
import { staticServer } from "../../constant";
import { Comment, ICommentProps } from "../../component/Comment";
import cx from "classnames";
import { getUserDetail } from "../../api/user";

interface Props {}

export const ArticlePanel: React.FC<Props> = () => {
  const routerMatch = useRouteMatch<{ blogId: string }>();
  const { blogId } = routerMatch.params;
  const { state } = useContext(UserContext);
  const [isLoad, setLoad] = useState<boolean>(false);
  const [article, setArticle] = useState<TBlogDetailInfo>(
    {} as TBlogDetailInfo
  );

  const [comment, setComment] = useState<
    TCommentType[]
  >([]);

  const [userDetail, setUserDetail] = useState<IUserDetail | undefined>(
    undefined
  );

  async function getDetail() {
    const data = await getBlogDetail(+blogId);
    setLoad(false);
    setArticle(data.data.data);
  }

  const getUserInfo = async () => {
    const { data } = await getUserDetail(state.userId);
    if (data.data) {
      const { data: userDetail } = data;
      setUserDetail(userDetail);
    }
  };

  const getCommentList = useCallback(async () => {
    const { data } = await getComment(+blogId);
    const { data: commentDetail } = data;
    setComment(commentDetail)
  }, [blogId]);

  const handleSubCommit: ICommentProps["submitFunc"] = async (
    value,
    clearInput,
    replyId
  ) => {
    const { data } = await addComment(state.userId, value, replyId, +blogId);
    if (data) {
      const { status } = data;
      status && clearInput();
    }
  };

  useEffect(() => {
    setLoad(true);
    getUserInfo();
    getDetail();
    getCommentList();
  }, [blogId, state.userId]);

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
            style={{ marginTop: "10px" }}
          >
            <span className={styles.time}>{article.lastUpdateTime}</span>
            {article.tags &&
              article.tags.map((elem, index) => (
                <Tag
                  style={{ marginLeft: "10px" }}
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
        <div className={styles.comment}>
          <Comment
            commentList={comment}
            title="评论列表"
            userInfo={userDetail}
            submitFunc={handleSubCommit}
          ></Comment>
        </div>
      </div>
    </>
  );
};
