import React, { useContext, useState, useEffect, useCallback } from 'react';
import styles from './style.module.scss';
import { UploadBtn, IUploadInfo } from '../../component/Upload';
import { ApiHost } from '../../constant';
import { UserContext } from '../../store/users';
import { MyWaterfall, IWaterfallProps } from '../../component/MyWaterFall';
import FileCard from '../../component/FileCard';
import {
  Button,
  Dialog,
  Form,
  FormStrategy,
  FieldSet,
  FormInputField,
  Validators,
  Notify
} from 'zent';

import { addNewFile, getFileList } from '../../api/file';
import { TFileListParams } from '../../api/interface';

const { openDialog, closeDialog } = Dialog;

interface Props {}

interface IFormValue {
  name: string;
  fileBrief: string;
  file: {
    files: IUploadInfo[];
  };
}

export const FileCenter: React.FC<Props> = () => {
  const dialogId = 'upLoadFile';
  const form = Form.useForm(FormStrategy.View);
  const { state } = useContext(UserContext);
  const [currentPage, setPage] = useState<number>(1);
  const [fileList, setFileList] = useState<TFileListParams[]>([]);
  const pageSize = 5;
  const [pageUpdate, setPageUpdate] = useState<number>(0);

  const getFormValue = async () => {
    // @ts-ignore
    const value = form.getValue() as IFormValue;
    const { fileBrief, file, name } = value;
    const { filePath } = file.files[0];

    const { data } = await addNewFile(name, fileBrief, state.userId, filePath);
    if (data.status) {
      closeDialog(dialogId);
      form.resetValue();
      Notify.success(data.msg);
      setPageUpdate(pageUpdate + 1);
    } else {
      Notify.error(data.msg);
    }
  };

  const handleScroll: IWaterfallProps['handleLoading'] = async (
    page,
    resolve,
    reject
  ) => {
    if (resolve) {
      const { data } = await getFileList(pageSize, page, state.userId);
      const { data: _fileList } = data;
      if (_fileList.length) {
        const _l = [...fileList, ..._fileList];
        setFileList(_l);
        resolve(true);
        return;
      }

      reject && reject('已经到底啦～');
    }
  };

  const _getFileList = useCallback(
    async (pageNumber: number) => {
      const { data } = await getFileList(pageSize, pageNumber, state.userId);
      setFileList(data.data);
      setPageUpdate(pageUpdate + 1);
    },
    [state.userId]
  );

  useEffect(() => {
    _getFileList(currentPage);
  }, [state.userId, currentPage, pageUpdate]);

  const renderChild = () => (
    <Form form={form} layout="horizontal">
      <FormInputField
        label={'文件名'}
        name="name"
        required
        validators={[Validators.required('请输入文件名')]}
      ></FormInputField>

      <FormInputField
        label={'文件简介'}
        name="fileBrief"
        required
        validators={[Validators.required('请填写文件的简介信息')]}
        props={{
          type: 'textarea',
          width: '80%'
        }}
      ></FormInputField>

      {/* 
      //@ts-ignore */}
      <FieldSet name="file" defaultValue="">
        <UploadBtn
          title="上传文件"
          uploadPath={`${ApiHost}/file/fileUpload`}
          hasProcess
          isInField={true}
          maxFileSize={100 * 1000 * 1000}
        ></UploadBtn>
        <Button onClick={getFormValue} style={{ textAlign: 'right' }}>
          提交文件
        </Button>
      </FieldSet>
    </Form>
  );

  const openUpload = () => {
    openDialog({
      dialogId,
      title: '我要上传',
      children: renderChild()
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.uploadBtn}>
        <Button type="primary" outline onClick={openUpload}>
          我要上传
        </Button>
      </div>
      <div className={styles.fileList}>
        <MyWaterfall handleLoading={handleScroll} initPage={1}>
          {fileList.map((elem, index) => (
            <FileCard
              data={elem}
              key={`filecard-${index}`}
              onDownload={() => {
                setPageUpdate(pageUpdate + 1);
              }}
            ></FileCard>
          ))}
          {
            !fileList.length && (
              <div className={styles.emptyList}>文件列表为空~</div>
            )
          }
        </MyWaterfall>
      </div>
    </div>
  );
};
