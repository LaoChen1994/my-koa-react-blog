import React from "react";
import { IUserDetail } from "../../api/interface";
import styles from "./style.module.scss";
import { staticServer, transMap } from "../../constant";
import { useHistory } from "react-router-dom";
import { Icon } from "zent";
import cx from "classnames";

interface Props {
  data: IUserDetail;
  addLink?: boolean;
}

export const DetailBlock: React.FC<Props> = props => {
  const { data: userInfo, addLink = false } = props;
  const history = useHistory();

  const {
    avatarUrl,
    userName,
    userId,
    nicoName,
    phoneNumber,
    introduction,
    ...res
  } = userInfo;

  const handleLink = () => {
    history.push(`/blog/${userId}`);
  };

  return (
    <div className={styles.userInfo}>
      <div className={styles.header}>
        <img src={`${staticServer}${avatarUrl}`} alt="用户头像" />
        <div className={styles.header_text}>
          <div className={styles.username}>{nicoName || userName}</div>
          {addLink && (
            <div className={styles.link} onClick={handleLink}>
              <Icon
                type="link"
                style={{ fontSize: "20px", verticalAlign: "middle" }}
              />
              去Ta的主页
            </div>
          )}
          <div
            className={cx({
              [styles.notes]: true,
              [addLink ? styles.oneline : styles.twoLine]: true
            })}
          >
            {introduction}
          </div>
        </div>
      </div>
      <div className={styles.detail}>
        {Object.entries(res).map(
          ([key, value], index) =>
            transMap[key as keyof IUserDetail] && (
              <div className={styles.detailText} key={`item-${index}`}>
                {transMap[key as keyof IUserDetail]}: {value}
              </div>
            )
        )}
      </div>
    </div>
  );
};
