import React, { useState } from 'react';
import { ApiHost } from '../../constant';
import { Button, FormControl, Progress } from 'zent';

export type UploadCompletCallback<T> = (
  e: ProgressEvent<XMLHttpRequestEventTarget>,
  reponse: T
) => void;

export type UploadStartCallback = (
  e: ProgressEvent<XMLHttpRequestEventTarget>
) => void;

export type UploadProcessCallback = (loaded: number, total: number) => void;

interface Props {
  onComplete?: UploadCompletCallback<any>;
  onStart?: UploadStartCallback;
  onProcess?: UploadProcessCallback;
  hasProcess?: boolean;
  title: string;
  uploadPath: string;
}

export const UploadBtn: React.FC<Props> = props => {
  const { onComplete, onStart, onProcess, hasProcess = false, title, uploadPath } = props;
  const [progress, setProgress] = useState<number>(0);
  const [uploadStatus, setStatus] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      if (!files.length) return;

      // 将文件处理成formData
      let formData = new FormData();
      for (let k in files) {
        formData.append('file', files[k], window.encodeURI(files[k].name));
      }

      let xhr = new XMLHttpRequest();

      xhr.responseType = 'json';
      xhr.timeout = 5000;
      xhr.open('POST', uploadPath, true);

      // 事件监听
      xhr.addEventListener('loadstart', e => {
        setProgress(0);
        setStatus(true);
        onStart && onStart(e);
      });

      xhr.upload.onprogress = function(e) {
        const { total, loaded } = e;
        setProgress((loaded / total) * 100);
        onProcess && onProcess(loaded, total);
      };

      xhr.addEventListener('load', e => {
        const result = xhr.response;
        onComplete && onComplete(e, result);
      });

      xhr.send(formData);
    } else {
      return;
    }
  };

  const selectFile = () => {
    const btn = document.querySelector("input[type='file']");
    //@ts-ignore
    btn && btn.click();
  };
  return (
    <FormControl label={title}>
      <input type="file" onChange={handleChange} style={{ display: 'none' }} />
      <Button onClick={selectFile}>上传</Button>
      {hasProcess && uploadStatus && <Progress percent={progress}></Progress>}
    </FormControl>
  );
};

