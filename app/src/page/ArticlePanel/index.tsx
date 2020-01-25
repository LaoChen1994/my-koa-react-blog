import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef
} from "react";
import { UserContext } from "../../store/users";
import { useRouteMatch } from "react-router-dom";
import { getBlogDetail, addComment, getComment } from "../../api/blog";
import styles from "./style.module.scss";
import { FullScreenLoading, Tag, Notify } from "zent";
import {
  TBlogDetailInfo,
  IUserDetail,
  TCommentList
} from "../../api/interface";
import { staticServer } from "../../constant";
import {
  CommentWithRef,
  ICommentProps,
  ICommentRefProps
} from "../../component/Comment";
import cx from "classnames";
import { getUserDetail } from "../../api/user";

interface Props {}

export const ArticlePanel: React.FC<Props> = () => {
  const routerMatch = useRouteMatch<{ blogId: string }>();
  const { blogId } = routerMatch.params;
  const { state } = useContext(UserContext);
  const [isLoad, setLoad] = useState<boolean>(false);
  const commentRef = useRef<ICommentRefProps>();
  const [article, setArticle] = useState<TBlogDetailInfo>(
    {} as TBlogDetailInfo
  );

  const [comment, setComment] = useState<TCommentList[]>([]);
  const [userDetail, setUserDetail] = useState<IUserDetail | undefined>(
    undefined
  );

  const [forceUpdate, setForceUpdate] = useState<number>(0);

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

  const getCommentList = useCallback(
    async (pageSize?: number, _pageNumber?: number) => {
      const { data } = await getComment(+blogId, _pageNumber, pageSize);
      const { commentList, totalNumber, pageNumber } = data.data;
      setComment(commentList);
      const { current } = commentRef;

      console.log(current);

      current &&
        (() => {
          const { setPagination } = current;
          setPagination(state => ({
            ...state,
            current: +pageNumber,
            total: totalNumber
          }));
        })();
    },
    [blogId]
  );

  const handleSubCommit: ICommentProps["submitFunc"] = async (
    value,
    clearInput,
    replyId,
    cancelReply
  ) => {
    const { data } = await addComment(state.userId, value, replyId, +blogId);
    if (data) {
      const { status, msg } = data;

      status &&
        (() => {
          clearInput();
          Notify.success(msg);
          setForceUpdate(forceUpdate + 1);
          cancelReply && cancelReply();
        })();

      status && clearInput();
      status && Notify.success(msg);
      status && setForceUpdate(forceUpdate + 1);
    }
  };

  useEffect(() => {
    setLoad(true);
    getUserInfo();
    getDetail();
    getCommentList();
  }, [blogId, state.userId, forceUpdate]);

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
          <CommentWithRef
            commentList={comment}
            title="评论列表"
            userInfo={userDetail}
            submitFunc={handleSubCommit}
            // @ts-ignore
            ref={commentRef}
            paginationChange={getCommentList}
          ></CommentWithRef>
        </div>
      </div>
    </>
  );
};
