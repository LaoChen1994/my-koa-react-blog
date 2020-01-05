import React, { useState, useRef, useImperativeHandle } from 'react';
import BraftEritor from 'braft-editor';
import { IWriterRefExpose } from './interface';

interface Props {
  myRef: React.Ref<any>;
}

const Writer: React.FC<Props> = props => {
  const { myRef } = props;

  const [content, setContent] = useState<any>(
    BraftEritor.createEditorState(null)
  );

  const handleChange = (newState: any) => {
    setContent(newState);
  };

  useImperativeHandle(myRef, () => ({
    getHTMLContent: () => content.toHTML()
  }));

  return (
    <div>
      <BraftEritor value={content} onChange={handleChange}></BraftEritor>
    </div>
  );
};

export const RefWriter = React.forwardRef<IWriterRefExpose>((props, ref) => (
  <Writer {...props} myRef={ref}></Writer>
));
