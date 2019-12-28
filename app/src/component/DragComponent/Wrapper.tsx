import React, { useContext, useRef, useState } from 'react';
import style from './style.module.scss';
import cx from 'classnames';

import { DragContext } from './store';

interface Props {
  className?: string;
}

export const DragWrapper: React.FC<Props> = props => {
  const { children, className = '' } = props;
  const { Factory } = useContext(DragContext);
  const [isFocus, setFocus] = useState<boolean>(false);
  const divEl = useRef<HTMLDivElement>(null);

  const handleDragenter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragover = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const _str = e.dataTransfer.getData('sourceObj');
    const _htmlNode = Factory.getHtmlNode(_str);
    const { current } = divEl;
    current && _htmlNode && current.append(_htmlNode);
  };

  const handleFocus = () => {
    setFocus(true);
  };

  return (
    <div
      className={cx({
        [style.wrapper]: true,
        [style.active]: isFocus,
        [className]: true
      })}
      draggable={false}
      onDragEnter={handleDragenter}
      onDragOver={handleDragover}
      onDrop={handleDrop}
      onMouseOver={handleFocus}
      onMouseLeave={() => setFocus(false)}
      ref={divEl}
      tabIndex={1}
      
    >
      {children}
    </div>
  );
};
