import React, { useState, useImperativeHandle } from 'react';
import BraftEritor, { MediaType } from 'braft-editor';
import { IWriterRefExpose } from './interface';
import { ApiHost, staticServer } from '../../constant';
import { IUploadResponse, ICommonApiInterface } from '../../api/interface';

interface Props {
  myRef: React.Ref<any>;
  defaultValue?: string;
}

const Writer: React.FC<Props> = props => {
  const { myRef, defaultValue } = props;

  const [content, setContent] = useState<any>(
    BraftEritor.createEditorState(null)
  );

  const handleChange = (newState: any) => {
    setContent(newState);
  };

  useImperativeHandle(myRef, () => ({
    getHTMLContent: () => content.toHTML()
  }));

  const mediaUpload: MediaType['uploadFn'] = params => {
    const upLoadUrl = `${ApiHost}/blog/blogImageUpload`;
    const fd = new FormData();
    const xhr = new XMLHttpRequest();
    const { file } = params;

    fd.append('file', file);
    xhr.responseType = 'json';
    xhr.timeout = 5000;

    function successCallback(event: ProgressEvent<XMLHttpRequestEventTarget>) {
      const { response } = event.target as XMLHttpRequest;
      const { data } = response as ICommonApiInterface<IUploadResponse>;
      const { fileName, filePath } = data;

      params.success({
        url: `${staticServer}${filePath}`,
        meta: {
          id: 'insert-image',
          title: fileName,
          alt: fileName,
          loop: false,
          autoPlay: false,
          controls: false,
          poster: ''
        }
      });
    }

    const processCallback = (
      event: ProgressEvent<XMLHttpRequestEventTarget>
    ) => {
      params.progress(event.loaded / event.total);
    };

    const errorCallBack = () => {
      params.error({
        msg: 'Error'
      });
    };

    xhr.addEventListener('load', successCallback, false);
    xhr.upload.addEventListener('progress', processCallback, false);
    xhr.addEventListener('error', errorCallBack, false);

    xhr.open('POST', upLoadUrl, true);
    xhr.setRequestHeader('Accept', 'application/json;charset=UTF-8');
    xhr.setRequestHeader(
      'Authorization',
      `Bearer ${localStorage.getItem('userToken')}`
    );
    xhr.withCredentials = true;
    xhr.send(fd);
  };

  return (
    <div>
      <BraftEritor
        value={content}
        onChange={handleChange}
        media={{ uploadFn: mediaUpload }}
        {...(defaultValue ? { defaultValue } : {})}
      ></BraftEritor>
    </div>
  );
};

export const RefWriter = React.forwardRef<IWriterRefExpose>((props, ref) => (
  <Writer {...props} myRef={ref}></Writer>
));
