import React, { useState } from "react";
import { userRegister, checkUser } from "../../api/user";
import {
  Form,
  FormStrategy,
  FormInputField,
  Notify,
  Validators,
  Button
} from "zent";

import { UploadBtn, UploadCompletCallback } from "../../component/Upload";

import styles from "./style.module.scss";
import { IValidator } from "formulr";
import { TLoadFileRes } from "../../api/interface";
import { ApiHost } from "../../constant";

interface Props {}

export const Register: React.FC<Props> = () => {
  const form = Form.useForm(FormStrategy.View);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const validatePassword: IValidator<string> = (value, ctx) => {
    const form = ctx.getFormValue();

    // @ts-ignore
    if (form.password !== value) {
      return { name: "passwordEqual", message: "前后两次密码输入不同" };
    }

    return null;
  };

  const validateForm = () =>
    form
      .validate(Form.ValidateOption.IncludeAsync | Form.ValidateOption.Default)
      .then((data: any[]): [boolean, any[]] => {
        if (data.slice(0, data.length - 2).some(elem => elem === undefined)) {
          return [false, ["尚有未填写的表格内容"]];
        } else {
          const errorList = data.filter(elem => ![null, undefined].includes(elem));

          if (errorList.length) {
            return [false, errorList.map(elem => elem.message)];
          }
        }

        return [true, []];
      });

  const userValidate = async () => {
    const { username } = form.getValue();
    const { data } = await checkUser(username as string);
    if (data.status) {
      Notify.success(data.msg);
    } else {
      Notify.error(data.msg);
    }
  };

  const handleSubmit = async () => {
    const [isValid, message] = await validateForm();
    if (isValid) {
      const formValue = form.getValue();
      const { username, password, phoneNumber, email } = formValue;

      const { data } = await userRegister(
        username as string,
        password as string,
        email as string,
        phoneNumber as string,
        avatarUrl as string
      );

      if (data.status) {
        Notify.success(data.msg);
        form.resetValue();
      } else {
        Notify.error(data.msg);
      }
    } else {
      message.forEach(elem => Notify.error(elem));
    }
  };

  const handleReset = () => {
    form.resetValue();
  };

  const handleUpload: UploadCompletCallback<TLoadFileRes> = (e, res) => {
    const { avatarUrl } = res;
    setAvatarUrl(avatarUrl);
  };

  return (
    <div className={styles.wrapper}>
      <Form form={form} layout="horizontal">
        <FormInputField
          label="用户名:"
          name="username"
          props={{
            placeholder: "请输入用户名"
          }}
          required
          validators={[Validators.required("请输入用户名")]}
        ></FormInputField>
        <FormInputField
          label="密码"
          name="password"
          props={{
            type: "password",
            placeholder: "请设置密码"
          }}
          validators={[
            Validators.required("请输入密码"),
            Validators.pattern(
              /(?=.{6,16})(?=.*\d)(?=.*[a-zA-Z])/,
              "密码至少为6-16位且包含至少一个数字和字母"
            )
          ]}
          required
        ></FormInputField>
        <FormInputField
          label="确认密码"
          name="rPassword"
          props={{ type: "password", placeholder: "请再次输入密码" }}
          required
          validators={[validatePassword]}
        ></FormInputField>
        <FormInputField
          name="email"
          label="Email"
          required
          validators={[Validators.email("请输入正确的email地址")]}
          props={{
            placeholder: "请输入Email地址"
          }}
        ></FormInputField>
        <FormInputField
          name="phoneNumber"
          label="手机号"
          required
          validators={[
            Validators.required("请输入联系方式"),
            Validators.pattern(/^1([3-9]\d{9})/, "请输入正确的联系方式")
          ]}
          props={{
            placeholder: "请输入联系电话"
          }}
        ></FormInputField>

        <UploadBtn
          title="上传头像"
          hasProcess={true}
          onComplete={handleUpload}
          uploadPath={`${ApiHost}/user/upload`}
        ></UploadBtn>

        <div className={styles.controller}>
          <Button type="warning" onClick={userValidate}>
            用户名检查
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            注册
          </Button>
          <Button type="danger" outline onClick={handleReset}>
            重置
          </Button>
        </div>
      </Form>
    </div>
  );
};
