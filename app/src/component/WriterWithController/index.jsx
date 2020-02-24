import React, { useState, useImperativeHandle, useMemo } from "react";
import BraftEritor from "braft-editor";
import { Dialog, Input, Button } from "zent";
import { ApiHost, staticServer } from "../../constant";
import { ContentUtils } from "braft-utils";
import CodeScript from "./CodeScript";

import styles from "./style.module.scss";

const { openDialog, closeDialog } = Dialog;

const Writer = props => {
  const { myRef, defaultValue } = props;

  const [content, setContent] = useState(
    BraftEritor.createEditorState(defaultValue || "")
  );

  const handleChange = newState => {
    setContent(newState);
  };

  const [scriptContent, setScript] = useState("");

  useImperativeHandle(myRef, () => ({
    getHTMLContent: () => {
      console.log(content.toHTML());
      return content.toHTML();
    }
  }));

  const mediaUpload = params => {
    const upLoadUrl = `${ApiHost}/blog/blogImageUpload`;
    const fd = new FormData();
    const xhr = new XMLHttpRequest();
    const { file } = params;

    fd.append("file", file);
    xhr.responseType = "json";
    xhr.timeout = 5000;

    function successCallback(event) {
      const { response } = event.target;
      const { data } = response;
      const { fileName, filePath } = data;

      params.success({
        url: `${staticServer}${filePath}`,
        meta: {
          id: "insert-image",
          title: fileName,
          alt: fileName,
          loop: false,
          autoPlay: false,
          controls: false,
          poster: ""
        }
      });
    }

    const processCallback = event => {
      params.progress(event.loaded / event.total);
    };

    const errorCallBack = () => {
      params.error({
        msg: "Error"
      });
    };

    xhr.addEventListener("load", successCallback, false);
    xhr.upload.addEventListener("progress", processCallback, false);
    xhr.addEventListener("error", errorCallBack, false);

    xhr.open("POST", upLoadUrl, true);
    xhr.setRequestHeader("Accept", "application/json;charset=UTF-8");
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${localStorage.getItem("userToken")}`
    );
    xhr.withCredentials = true;
    xhr.send(fd);
  };

  const changeContextWithCode = () => {
    const handleSubmit = scriptContent => {
      setContent(
        ContentUtils.insertAtomicBlock(content, "add-code", true, {
          scriptContent
        })
      );
      closeDialog("scriptDialog");
    };

    openDialog({
      dialogId: "scriptDialog",
      title: "请输入代码段",
      children: (
        <ScriptInput
          getContent={value => setScript(value)}
          handleSubmit={handleSubmit}
        />
      )
    });
  };

  const extendControls = [
    {
      key: "codep", // 控件唯一标识，必传
      type: "button",
      title: "插入代码段", // 指定鼠标悬停提示文案
      className: styles["my-button"], // 指定按钮的样式名
      html: null, // 指定在按钮中渲染的html字符串
      text: "Code", // 指定按钮文字，此处可传入jsx，若已指定html，则text不会显示
      onClick: changeContextWithCode
    }
  ];

  const blockRenderFn = (contentBlock, { editor, editorState }) => {
    const content = editorState.getCurrentContent();

    if (contentBlock.getType() === "atomic") {
      const entity = content.getEntity(contentBlock.getEntityAt(0));
      if (entity.getType() === "add-code") {
        const { scriptContent } = entity.getData();
        convertString2HTML({ scriptContent });
        return {
          component: CodeScript,
          editable: false,
          props: { editor, editorState, scriptContent }
        };
      }
    }
  };

  const convertString2HTML = ({ scriptContent }) => {
    let htmlArray = scriptContent.split(/\r?\n/);
    let template = `
    <pre>
      <ul>
        ${htmlArray.map((temp, i) => `<li>${i}</li>`).join("")}
      </ul>
      <code>
        ${htmlArray
          .map((temp, i) => `<div class="lineCode">${temp}</div>`)
          .join("")}
      </code>
    </pre>
    `;
    return template;
  };

  const blockExportFn = (contentState, block) => {
    if (block.type === "atomic") {
      let ranges = block.entityRanges.length > 0;

      if (ranges) {
        let entity = contentState.getEntity(
          contentState.getBlockForKey(block.key).getEntityAt(0)
        );

        if (entity.getType() === "add-code") {
          let data = entity.getData();
          convertString2HTML && convertString2HTML(data);
          return convertString2HTML(data);
        }
      }
    }

    if (block.type === "unstyled" && !block.text.length) {
      return "<p><br /></p>";
    }
  };

  return (
    <div>
      <BraftEritor
        value={content}
        onChange={handleChange}
        media={{ uploadFn: mediaUpload }}
        extendControls={extendControls}
        blockRendererFn={blockRenderFn}
        // excludeControls={["code"]}
        converts={{ blockExportFn }}
      ></BraftEritor>
    </div>
  );
};

const ScriptInput = props => {
  const [content, setContent] = useState("");
  const { getContent, handleSubmit } = props;

  const changeValue = e => {
    const { value } = e.target;
    setContent(value);
    getContent && getContent(value);
  };

  const _handleSubmit = () => {
    handleSubmit && handleSubmit(content);
  };

  return (
    <div>
      <Input
        type="textarea"
        value={content}
        onChange={changeValue}
        style={{ height: 300 }}
      ></Input>
      <div className={styles.bottomController}>
        <Button type="primary" outline onClick={_handleSubmit}>
          添加
        </Button>
      </div>
    </div>
  );
};

export const RefWriter = React.forwardRef((props, ref) => (
  <Writer {...props} myRef={ref}></Writer>
));
