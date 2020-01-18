import React, { useRef, useState, useEffect, useContext } from "react";
import { RefWriter } from "./Writer";
import "braft-editor/dist/index.css";
import styles from "./style.module.scss";
import {
  FormInputField,
  Button,
  Form,
  FormStrategy,
  Validators,
  FieldSet,
  Notify
} from "zent";
import { IBlogTag } from "../../interface";
import { CloseTags, TNewTags } from "../../component/TagsSelection/CloseTags";
import { UserContext } from "../../store/users";

import { IWriterRefExpose } from "./interface";
import { getUserTags, addBlog, modifyBlog } from "../../api/blog";

import { useHistory, useRouteMatch } from "react-router-dom";

interface IFormState {
  title: string;
  tagList: { tags: TNewTags[] };
}

export interface IWriteBlogProps {
  defaultValue?: {
    content: string;
    title: string;
    tags: IBlogTag[];
  };
}

export const WriteBlog: React.FC<IWriteBlogProps> = props => {
  const writerRef = useRef<IWriterRefExpose>(null);
  const { defaultValue } = props;
  const form = Form.useForm(FormStrategy.View);
  const [userTags, setUserTag] = useState<IBlogTag[]>(defaultValue?.tags || []);
  const { state } = useContext(UserContext);
  const history = useHistory();
  const { params } = useRouteMatch<{ blogId: string }>();

  const addNewBlog = async () => {
    if (writerRef.current) {
      const { getHTMLContent } = writerRef.current;
      //@ts-ignore
      const { title, tagList } = form.getValue() as IFormState;
      const content = getHTMLContent() as string;

      const { data } = await addBlog(state.userId, {
        title,
        tags: tagList.tags,
        content
      });

      const { status, msg } = data;

      if (status) {
        Notify.success(msg);
        history.push("/");
      } else {
        Notify.error(msg);
      }
    } else {
      Notify.error("未获取到文章信息！");
    }
  };

  const handleModify = async () => {
    if (writerRef.current) {
      const { getHTMLContent } = writerRef.current;
      //@ts-ignore
      const { title, tagList } = form.getValue() as IFormState;
      const content = getHTMLContent() as string;

      const { data } = await modifyBlog(
        +params.blogId,
        title,
        content,
        tagList.tags,
        state.userId
      );

      const { status, msg } = data;

      if (status) {
        Notify.success(msg);
        history.push("/");
      } else {
        Notify.error(msg);
      }
    } else {
      Notify.error("未获取到文章信息！");
    }
  };

  const validatorLength = (maxLength: number) => (value: number | string) => {
    const valLen =
      typeof value === "number" ? value.toString().length : value.length;
    if (valLen > maxLength) {
      return { name: "maxLength", message: `超过最大长度${maxLength}` };
    }
  };

  useEffect(() => {
    async function updateTags() {
      const { data } = await getUserTags(state.userId);
      const { data: tagsList } = data;
      setUserTag(tagsList);
    }

    updateTags();
  }, [state]);

  return (
    <div className={styles.wrapper}>
      <Form form={form} layout="horizontal">
        <div className={styles.blogHeader}>
          <FormInputField
            name="title"
            validators={[
              Validators.required("请输入标题"),
              validatorLength(100)
            ]}
            required
            props={{
              maxLength: 100,
              width: "100%"
            }}
            label="文章标题:"
            className={styles.titleHeader}
            defaultValue={defaultValue?.title}
          ></FormInputField>

          <div className={styles.headerBtn}>
            <Button
              type="success"
              outline
              onClick={defaultValue ? handleModify : addNewBlog}
            >
              {defaultValue ? "提交修改" : "发布文章"}
            </Button>
          </div>
        </div>

        <div className={styles.textEditor}>
          <RefWriter
            ref={writerRef}
            defaultValue={defaultValue?.content}
          ></RefWriter>
        </div>
        {/* 
        // @ts-ignore */}
        <FieldSet name="tagList">
          <div className={styles.tagsController}>
            <CloseTags
              data={userTags}
              isReloaded={defaultValue?.tags}
            ></CloseTags>
          </div>
        </FieldSet>
      </Form>
      <div className={styles.controller}>
        <Button
          type="primary"
          outline
          onClick={defaultValue ? handleModify : addNewBlog}
        >
          {defaultValue ? "提交修改" : "发布文章"}
        </Button>
      </div>
    </div>
  );
};
