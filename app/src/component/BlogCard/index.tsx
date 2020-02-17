import React from "react";
import { TBlogBrief } from "../../api/interface";
import styles from "./style.module.scss";
import { useHistory } from "react-router-dom";
import { staticServer } from "../../constant";
import { Button, Dialog, Notify } from "zent";
import cx from "classnames";
import { deleteBlog } from "../../api/blog";

const { openDialog, closeDialog } = Dialog;
const dialogId = "confirmFrame";

interface Props {
  data: TBlogBrief;
  isEditable?: boolean;
  deleteCallBack?: () => void;
}

export const BlogCard: React.FC<Props> = props => {
  const { data, isEditable, deleteCallBack, ...res } = props;
  const {
    userName,
    lastUpdateTime,
    blogId,
    blogName,
    blogContent,
    avatarUrl,
    viewNumber,
    commentNumber
  } = data;
  const history = useHistory();

  const handleClick = () => {
    history.push(`/blog/artical/${blogId}`);
  };

  const handleEdit = () => {
    history.push(`/blog/blogEdit/${blogId}`);
  };

  const confirmDelete = async () => {
    const { data } = await deleteBlog(blogId);
    const { status, msg } = data;
    if (status) {
      Notify.success(msg);
      deleteCallBack && deleteCallBack();
    } else {
      Notify.error(msg);
    }
    closeDialog(dialogId);
  };

  const handleDelete = () => {
    openDialog({
      dialogId,
      title: "确认框",
      children: (
        <div>
          <span>
            确认要删除 <span className={styles.bold}>{blogName}</span>吗?
          </span>
          <div className={styles.important}>
            注意：在删除之后无法恢复该博文以及相关评论
          </div>
        </div>
      ),
      footer: (
        <div className={styles.bottomController}>
          <Button type="danger" outline onClick={confirmDelete}>
            确认
          </Button>
          <Button type="default" onClick={() => closeDialog(dialogId)}>
            取消
          </Button>
        </div>
      )
    });
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
          style={{ display: isEditable ? "block" : "none" }}
        >
          <Button type="primary" onClick={handleEdit}>
            编辑
          </Button>
          <Button type="success" outline onClick={handleClick}>
            查看
          </Button>
          <Button type="danger" onClick={handleDelete}>
            删除
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
        <span className={styles.time}>最近更新日期: {lastUpdateTime}</span>
        <div className={styles.right}>
          <span className={styles.comment}>评论数:{commentNumber}</span>
          <span className={styles.view}>浏览量:{viewNumber}</span>
        </div>
      </div>
    </div>
  );
};
