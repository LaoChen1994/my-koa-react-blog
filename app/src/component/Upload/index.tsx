import React, { useState } from "react";
import {
  Button,
  FormControl,
  Progress,
  Form,
  FieldUtils,
  Validators,
  Notify
} from "zent";

const { useField } = Form;
const { makeChangeHandler } = FieldUtils;

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
  isInField?: boolean;
  maxFileSize?: number;
  handleUploadRes?: (response: any) => { fileName: string; filePath: string };
}

export interface IUploadInfo {
  originName: string;
  fileName: string;
  filePath: string;
}

export const UploadBtn: React.FC<Props> = props => {
  const {
    onComplete,
    onStart,
    onProcess,
    hasProcess = false,
    title,
    uploadPath,
    isInField = false,
    maxFileSize = 1000 * 1000 * 3,
    handleUploadRes
  } = props;
  const [progress, setProgress] = useState<number>(0);
  const [uploadStatus, setStatus] = useState<boolean>(false);
  const uploadName = useField<IUploadInfo[]>(
    "files",
    [],
    [Validators.required("请选择文件")]
  );
  const [nameList, setNameList] = useState<string[]>([]);

  const handleInField = makeChangeHandler(uploadName);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      if (!files.length) return;

      // 将文件处理成formData
      let formData = new FormData();
      if (files[0].size > maxFileSize) {
        Notify.error(`上传文件过大，最大不能超过${maxFileSize / 1000 / 1000}M`);
        return;
      }

      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[0], window.encodeURI(files[0].name));
      }

      setNameList(
        Array.prototype.map.call(files, elem => elem.name) as string[]
      );

      const token = localStorage.getItem("userToken");

      let xhr = new XMLHttpRequest();

      xhr.responseType = "json";
      xhr.timeout = 5000;
      xhr.open("POST", uploadPath, true);

      token && xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      // 事件监听
      xhr.addEventListener("loadstart", e => {
        setProgress(0);
        setStatus(true);
        onStart && onStart(e);
      });

      xhr.upload.onprogress = function(e) {
        const { total, loaded } = e;
        setProgress((loaded / total) * 100);
        onProcess && onProcess(loaded, total);
      };

      xhr.addEventListener("load", e => {
        const result = xhr.response;
        const { fileName, filePath } = handleUploadRes
          ? handleUploadRes(result)
          : result;
        onComplete && onComplete(e, result);

        const upLoadInfo: IUploadInfo = {
          originName: files[0].name,
          fileName,
          filePath
        };

        isInField && handleInField([upLoadInfo]);
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

  const handleLoad = (e: any) => {
    console.log(e);
  };

  return (
    <FormControl label={title}>
      <input
        type="file"
        onChange={handleChange}
        style={{ display: "none" }}
        onLoad={handleLoad}
      />
      <Button onClick={selectFile}>上传</Button>
      <div style={{ display: uploadStatus ? "block" : "none" }}>
        文件:
        {nameList.map((elem, index) => (
          <span key={`file-${index}`} style={{ margin: "0 10px" }}>
            {elem}
          </span>
        ))}
        上传完成
      </div>
      {hasProcess && uploadStatus && <Progress percent={progress}></Progress>}
    </FormControl>
  );
};
