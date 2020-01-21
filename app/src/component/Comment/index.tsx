import React, { useState, useMemo, useCallback } from "react";
import styles from "./style.module.scss";
import { usePagination } from "../../hooks/usePagination";
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
import { IUserDetail, TCommentType } from "../../api/interface";
import cx from "classnames";

export interface ICommentProps {
  title?: string;
  commentList: TCommentType[];
  submitFunc?: (
    value: string,
    clearTable: () => void,
    replyId?: number
  ) => void;
  maxComments?: number;
  maxNumberFonts?: number;
  userInfo?: IUserDetail;
}

export function Comment(props: ICommentProps) {
  const {
    title = "评论列表",
    commentList,
    maxComments = 5,
    maxNumberFonts = 1000,
    userInfo,
    submitFunc
  } = props;
  const pageSize = 10;
  const [comVal, setComVal] = useState<string>("");
  const [replyId, setReplyId] = useState<number | undefined>(undefined);
  const [] = usePagination({
    current: 1,
    pageSize,
    total: 0
  })

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
      submitFunc && submitFunc(comVal, clearText, replyId);
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
              <div className={styles.commentInput}>
                {/* 
                //@ts-ignore */}
                <Input
                  type="textarea"
                  value={comVal}
                  onChange={handleChange}
                  className={styles.input}
                  // 这里没办法只能写死，因为组件库的class是加在外部的div上控制高度，没办法直接控制里面input的高度
                  style={{ height: 120 }}
                />
                <div className={styles.inputBottom}>
                  <span className={styles.notes}>
                    评论字数({comVal.length}/{maxNumberFonts})
                  </span>
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
      <Row key={`"commment-${index}"`}>
        <Col span={24}>
          <div className={styles.card}>
            <div className={styles.comment}>{elem.commentItem}</div>
            <div className={styles.bottom}>
              <UserInfo
                avatarUrl={elem.avatarUrl}
                name={elem.userName}
                time={elem.commentDate}
              />
            </div>
          </div>
        </Col>
      </Row>
    ));
  }, [commentList]);

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
      </Grid>
    </Config>
  );
}
