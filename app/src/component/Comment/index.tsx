import React, {
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
  Ref,
  createRef
} from "react";
import styles from "./style.module.scss";
import { usePagination, IPaginationProps } from "../../hooks/usePagination";
import UserInfo from "../UserInfoInline";
import { DetailBlock } from "../UDetailBlock";
import {
  LayoutGrid as Grid,
  LayoutRow as Row,
  LayoutCol as Col,
  LayoutConfigProvider as Config,
  Input,
  IInputChangeEvent,
  Notify,
  Button,
  Pagination
} from "zent";
import { IUserDetail, TCommentType, TCommentList } from "../../api/interface";
import cx from "classnames";
import { PaginationChangeHandler } from "zent/es/pagination/impl/BasePagination";

export interface ICommentProps {
  title?: string;
  commentList: TCommentList[];
  submitFunc?: (
    value: string,
    clearTable: () => void,
    replyId?: number,
    cancelReply?: () => void
  ) => void;
  maxComments?: number;
  maxNumberFonts?: number;
  userInfo?: IUserDetail;
  myRef?: Ref<ICommentRefProps>;
  paginationChange?: (pageSize: number, current: number) => void;
}

export interface ICommentRefProps {
  setPagination: React.Dispatch<React.SetStateAction<IPaginationProps>>;
}

export function Comment(props: ICommentProps) {
  const {
    title = "评论列表",
    commentList,
    maxComments = 5,
    maxNumberFonts = 1000,
    userInfo,
    submitFunc,
    myRef,
    paginationChange
  } = props;
  const [comVal, setComVal] = useState<string>("");
  const [replyId, setReplyId] = useState<number | undefined>(undefined);
  const [pagination, setPagination] = usePagination({
    current: 1,
    pageSize: maxComments,
    total: 0
  });

  const editRef = createRef<Input>();

  useImperativeHandle(myRef, () => ({
    setPagination
  }));

  const cancelReply = () => {
    setReplyId(undefined);
    setComVal("");
  };

  const pageChange: PaginationChangeHandler = ({ pageSize, current }) => {
    paginationChange && paginationChange(pageSize, current);
  };

  const renderCommentReply = (comment: TCommentType) => () => {
    const funcObj = {
      回复: function() {
        const $comment = document.getElementById('comment');
        if ($comment) {
          window.scrollTo(0, $comment.offsetTop - $comment.clientHeight);
        }

        setReplyId(comment.commentId);
        setComVal(`@${comment.userName}:`);

      }
    };

    return (
      <div style={{ textAlign: "right" }}>
        {Object.entries(funcObj).map(elem => (
          <span className={styles.commentBtn} onClick={elem[1]}>
            {elem[0]}
          </span>
        ))}
      </div>
    );
  };

  const renderEdit = useMemo(() => {
    const handleChange = (e: IInputChangeEvent) => {
      const { value } = e.target;
      if (value.length > maxNumberFonts) {
        Notify.error(`评论字数最多支持${maxNumberFonts}字`);
      } else {
        setComVal(value);
      }
    };

    const clearText = () => {
      setComVal("");
    };

    const sendComment = async () => {
      submitFunc && submitFunc(comVal, clearText, replyId, cancelReply);
    };

    return (
      <>
        {
          <Row
            justify="center"
            align="start"
            className={cx({
              [styles.wrapper]: true,
              [styles.isUnuse]: userInfo
            })}
          >
            <Col span={5}>
              {userInfo ? (
                <DetailBlock data={userInfo}></DetailBlock>
              ) : (
                <div>用户未登陆</div>
              )}
            </Col>
            <Col span={19}>
              <div className={styles.commentInput} id="comment">
                {/* 
                //@ts-ignore */}
                <Input
                  type="textarea"
                  value={comVal}
                  onChange={handleChange}
                  className={styles.input}
                  // 这里没办法只能写死，因为组件库的class是加在外部的div上控制高度，没办法直接控制里面input的高度
                  style={{ height: 120 }}
                  ref={editRef}
                />
                <div className={styles.inputBottom}>
                  <span className={styles.notes}>
                    评论字数({comVal.length}/{maxNumberFonts})
                  </span>
                  {replyId && (
                    <Button type="warning" onClick={cancelReply}>
                      取消回复
                    </Button>
                  )}
                  <Button type="primary" outline onClick={sendComment}>
                    提交评论
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        }
      </>
    );
  }, [comVal, setComVal, userInfo]);

  const renderComment = useMemo(() => {
    return commentList.map((elem, index) => (
      <>
        <Row key={`commment-${index}`}>
          <Col span={24}>
            <div className={styles.card}>
              <div className={styles.comment}>{elem.commentItem}</div>
              <div className={styles.bottom}>
                <UserInfo
                  avatarUrl={elem.avatarUrl}
                  name={elem.userName}
                  time={elem.commentDate}
                  extraRender={renderCommentReply(elem)}
                />
              </div>
            </div>
          </Col>
        </Row>
        {elem.subCommentList.map((x, i) => (
          <Row key={`subComment-${i}`} justify="end">
            <Col span={22}>
              <div className={styles.card}>
                <div className={styles.comment}>{x.commentItem}</div>
                <div className={styles.bottom}>
                  <UserInfo
                    avatarUrl={x.avatarUrl}
                    name={x.userName}
                    time={x.commentDate}
                  />
                </div>
              </div>
            </Col>
          </Row>
        ))}

        <Row key={`subcomment-${index}`}></Row>
      </>
    ));
  }, [commentList, pagination]);

  return (
    <Config
      value={{
        rowGutter: 8,
        colGutter: { fallback: 8, xxl: 32, xl: 24, lg: 16, xs: 0 }
      }}
    >
      <Grid className={styles.wrapper}>
        <Row justify="start">
          <Col span={24}>
            <div className={styles.title}>{title}</div>
          </Col>
        </Row>
        {renderEdit}
        {renderComment}
        <Row>
          <Col span={24}>
            <Pagination
              current={pagination.current}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onChange={pageChange}
            ></Pagination>
          </Col>
        </Row>
      </Grid>
    </Config>
  );
}

export const CommentWithRef = forwardRef<ICommentRefProps, ICommentProps>(
  (props, ref) => <Comment {...props} myRef={ref}></Comment>
);
