import React, { useState } from "react";
import styles from "./style.module.scss";
import { Notify, Icon, Button, BlockLoading } from "zent";

export interface IAvatarUploadProps {
  maxFileSize: number;
  handleSubmit: (
    file: File,
    setLoad: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
}

export function AvatarUpload(props: IAvatarUploadProps) {
  const { maxFileSize, handleSubmit } = props;
  const [avatarFile, setFile] = useState<File>();
  const [localUrl, setFileUrl] = useState<string>();
  const [loading, setLoad] = useState<boolean>(false);

  const handleDrageOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    //@ts-ignore
    e.preventDefault();
    const { files } = e.dataTransfer;
    const file = files[0];

    if (!file.type.startsWith("image")) {
      Notify.error("只能上传图片文件");
      return;
    }

    if (!file) return;
    if (file.size > maxFileSize) {
      Notify.error("上传文件最大小不能超过10M");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
      const value = (e.target?.result as string) || "";
      setFileUrl(value);
    };

    setFile(file);
  };

  return (
    <BlockLoading loading={loading}>
      <div
        className={styles.avatarBox}
        onDragOver={handleDrageOver}
        onDrop={handleFileDrop}
      >
        {!(avatarFile && avatarFile.name) ? (
          <div className={styles.emptyBox}>
            {
              <span>
                <Icon type="customer-o" /> 请选择你需上传的头像
              </span>
            }
          </div>
        ) : (
          <>
            <div className={styles.wrapper}>
              <div className={styles.showImage}>
                <img src={localUrl} alt="上传头像" />
              </div>
              <Icon
                type="right-circle"
                style={{ fontSize: "20px", margin: "0 20px" }}
              />
              <div className={styles.resultBox}>
                <img
                  src={localUrl}
                  alt="处理后图片"
                  className={styles.result}
                />
                <div className={styles.caption}>处理后图片</div>
              </div>
            </div>
            <div className={styles.bottom}>
              <Button
                onClick={() => avatarFile && handleSubmit(avatarFile, setLoad)}
                type="primary"
                outline
              >
                提交修改
              </Button>
            </div>
          </>
        )}
      </div>
    </BlockLoading>
  );
}
