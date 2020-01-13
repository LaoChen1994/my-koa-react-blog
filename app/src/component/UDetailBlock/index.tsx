import React from 'react';
import { IUserDetail } from '../../api/interface';
import styles from './style.module.scss';
import { staticServer, transMap } from '../../constant';
import { useHistory } from 'react-router-dom';
import { Icon } from 'zent';

interface Props {
  data: IUserDetail;
}

export const DetailBlock: React.FC<Props> = props => {
  const { data: userInfo } = props;
  const history = useHistory();

  const { avatarUrl, userName, userId, ...res } = userInfo;

  const handleLink = () => {
    history.push(`/blog/${userId}`);
  };

  return (
    <div className={styles.userInfo}>
      <div className={styles.header}>
        <img src={`${staticServer}${avatarUrl}`} alt="用户头像" />
        <div className={styles.header_text}>
          <div className={styles.username}>{userName}</div>
          <div className={styles.link} onClick={handleLink}>
            <Icon
              type="link"
              style={{ fontSize: '20px', verticalAlign: 'middle' }}
            />
            去Ta的主页
          </div>
        </div>
      </div>
      <div className={styles.detail}>
        {Object.entries(res).map(
          ([key, value], index) =>
            transMap[key] && (
              <div className={styles.detailText} key={`item-${index}`}>
                {transMap[key]}: {value}
              </div>
            )
        )}
      </div>
    </div>
  );
};
