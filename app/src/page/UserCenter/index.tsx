import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../store/users";
import { transMap, staticServer } from "../../constant";

import styles from "./style.module.scss";
import {
  getUserDetail,
  modifyAvatarApi,
  updateAvatarApi,
  updateUserInfo
} from "../../api/user";
import { IUserDetail } from "../../api/interface";
import { Link } from "react-router-dom";
import {
  Icon,
  openDialog,
  Notify,
  closeDialog,
  Button,
  Form,
  FormInputField,
  FormDatePickerField,
  FormStrategy,
  Validators
} from "zent";
import { AvatarUpload, IAvatarUploadProps } from "../../component/AvatarUpload";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

export interface IUserCenterProps {}

export function UserCenter(props: IUserCenterProps) {
  const { state, dispatch } = useContext(UserContext);
  const [isEdit, setEdit] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<IUserDetail>({} as IUserDetail);
  const form = Form.useForm(FormStrategy.View);
  const { userId } = state;

  const dialogId = "avatarDialog";

  const getDetail = async () => {
    const { data } = await getUserDetail(userId);
    const { data: _userInfo } = data;
    console.log(_userInfo);
    setUserInfo(_userInfo);
  };

  useEffect(() => {
    getDetail();
  }, [userId, isEdit]);

  const handleSubmit: IAvatarUploadProps["handleSubmit"] = async (
    file,
    setLoad
  ) => {
    setLoad(true);
    const fileData = new FormData();
    fileData.append("file", file, file.name);
    const { data } = await modifyAvatarApi(fileData);
    const { status, data: fileDetail, msg } = data;
    if (status) {
      const { filePath } = fileDetail;
      const { data } = await updateAvatarApi(userId, filePath);
      data.status ? Notify.success(msg) : Notify.error(msg);
      data.status &&
        (() => {
          dispatch({
            type: "login",
            payload: { ...state, avatarUrl: filePath }
          });
          setUserInfo({ ...userInfo, avatarUrl: filePath });
          window.localStorage.setItem("userToken", data.data.token);
        })();
      setLoad(false);
      closeDialog(dialogId);
    } else {
      Notify.error(msg);
    }
  };

  const modifyAvatar = () => {
    openDialog({
      dialogId,
      title: "修改头像",
      children: (
        <AvatarUpload maxFileSize={MAX_FILE_SIZE} handleSubmit={handleSubmit} />
      )
    });
  };

  const handleModify = async () => {
    // @ts-ignore
    const formData = form.getValue() as Pick<
      IUserDetail,
      "Email" | "birth" | "nicoName" | "introduction" | "phoneNumber"
    >;

    const { data } = await updateUserInfo({ userId, ...formData });
    const { status, msg } = data;

    if (status) {
      Notify.success(msg);
      setEdit(false);
    } else {
      Notify.error(msg);
    }
  };

  const renderEdit = () => {
    const { Email, nicoName, birth, phoneNumber, introduction } = userInfo;

    return (
      <Form form={form} layout="horizontal">
        <FormInputField
          name="nicoName"
          defaultValue={nicoName}
          label="昵称"
          validators={[
            Validators.maxLength(11, "最大长度不能超过11字"),
            Validators.pattern(/^[^\s]+$/gi, "不支持空格等特殊字符")
          ]}
        />
        <FormInputField
          name="Email"
          defaultValue={Email}
          label="邮箱"
          validators={[Validators.email("请输入正确的Email地址")]}
        />
        <FormDatePickerField
          name="birth"
          defaultValue={birth || ""}
          label="出生日期"
        />
        <FormInputField
          name="phoneNumber"
          defaultValue={phoneNumber}
          label="电话号码"
          validators={[
            Validators.pattern(
              /^1[3(?=(3|5|7|8|9))|5(?=1|3|7|8|9)|7(?=1|3|7)|8(?=1|3|6|8|9)]\d{8}/gi,
              "请输入正确的电话号码"
            )
          ]}
        />
        {/* 
        // @ts-ignore */}
        <FormInputField
          name="introduction"
          defaultValue={introduction}
          label="用户简介"
          props={{ type: "textarea" }}
          validators={[Validators.maxLength(100, "简介不能超过100字")]}
        />
        <div className={styles.modifyController}>
          <Button type="primary" outline onClick={handleModify}>
            提交修改
          </Button>
        </div>
      </Form>
    );
  };

  const renderView = () => {
    const { avatarUrl, blogNumber, userId, ...res } = userInfo;

    return (
      <div className={styles.editWrap}>
        {Object.keys(res).map((key, index) => {
          const _key = key as keyof IUserDetail;
          return (
            <div className={styles.userItem} key={`userInfo-${index}`}>
              <span className={styles.itemTitle}>{transMap[_key]}: </span>
              <span className={styles.itemContent}>
                {_key !== "nicoName"
                  ? userInfo[_key]
                  : userInfo[_key] || userInfo["userName"]}
              </span>
            </div>
          );
        })}
        <div className={styles.showEdit}>
          <Button type="primary" icon="edit-o" onClick={() => setEdit(true)}>
            编辑信息
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.block}>
      <h1 className={styles.title}>个人资料</h1>
      <div className={styles.container}>
        <div className={styles.avatar}>
          <img
            src={
              userInfo.avatarUrl ? `${staticServer}${userInfo.avatarUrl}` : ""
            }
            alt="用户头像"
          />
          <div className={styles.modifyAvatar}>
            <span className={styles.text} onClick={modifyAvatar}>
              修改头像
            </span>
          </div>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userStatic}>
            <div className={styles.userId}>用户ID: {userInfo.userId}</div>
            <div className={styles.blogNumber}>
              博客数: {userInfo.blogNumber}
            </div>
            <div className={styles.toIndividual}>
              <Link to={`/blog/${userId}`}>
                去用户主页 <Icon type="approval" />
              </Link>
            </div>
          </div>
          {isEdit ? renderEdit() : renderView()}
        </div>
      </div>
    </div>
  );
}
