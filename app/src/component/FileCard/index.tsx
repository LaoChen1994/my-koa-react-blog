import * as React from 'react';
import { TFileListParams } from '../../api/interface';
import styles from './style.module.scss';
import { Button, Icon } from 'zent';
import BottomTips from '../UserInfoInline';
import { staticServer } from '../../constant';
import Axios from 'axios';
import { AddFileDownload } from '../../api/file';

export interface IAppProps {
  data: TFileListParams;
  onDownload?: () => void;
}

export default class App extends React.Component<IAppProps> {
  downloadBtn: React.RefObject<HTMLAnchorElement>;

  constructor(props: IAppProps) {
    super(props);
    this.downloadBtn = React.createRef<HTMLAnchorElement>();
  }

  async handleDownload() {
    const { data:_data, onDownload } = this.props;
    const { location, fileName,fileId } = _data;

    /(\/|\w)+\.(\w+)/gi.exec(location);
    const extname = RegExp.$2;
    const path = `${staticServer}${location}`;
    const downloadLink = this.downloadBtn.current;
    const data = await Axios.get(path, { responseType: 'blob' });
    const _path = window.URL.createObjectURL(new Blob([data.data]));

    downloadLink &&
      (() => {
        downloadLink.href = _path;
        downloadLink.download = `${fileName}.${extname}`;
        downloadLink.click();
        AddFileDownload(fileId);
        onDownload && onDownload();
      })();
  }

  public render() {
    const { data } = this.props;
    const {
      username,
      fileName,
      fileBrief,
      downloadNumber,
      publishDate,
      avatarUrl
    } = data;

    return (
      <div className={styles.wrapper}>
        <div className={styles.title}>
          <div className={styles.titleText}>{fileName}</div>
          <div className={styles.downLoad}>
            <span className={styles.downloads}>
              <Icon type="download"></Icon> 下载次数: {downloadNumber}
            </span>
            <a
              href=""
              download
              ref={this.downloadBtn}
              style={{ display: 'none' }}
            ></a>
            <Button
              type="success"
              outline
              onClick={this.handleDownload.bind(this)}
            >
              下载文件
            </Button>
          </div>
        </div>
        <div className={styles.brief}>文件简介：{fileBrief}</div>
        <div className={styles.notes}>
          <BottomTips
            avatarUrl={avatarUrl}
            name={username}
            time={publishDate}
          ></BottomTips>
        </div>
      </div>
    );
  }
}
