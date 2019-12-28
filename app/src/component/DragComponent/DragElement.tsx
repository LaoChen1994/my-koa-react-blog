import React, { useContext } from 'react';
import cx from 'classnames';
import { DragContext } from './store';
import { TDragCallback } from './index';

interface Props {
  className?: string;
  onDragStart?: TDragCallback;
  onDragEnd?: TDragCallback;
  onDrag?: TDragCallback;
}

export const DragElement: React.FC<Props> = props => {
  const { children, className, onDragStart, onDrag, onDragEnd } = props;
  const { Factory } = useContext(DragContext);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    event.dataTransfer.setData('sourceObj', Factory.getString(target));
    target.style.opacity = '0.5';
    onDragStart && onDragStart(event);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    target.style.opacity = '1';
    onDragEnd && onDragEnd(event);
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    onDrag && onDrag(event);
  };

  return (
    <div
      className={className && cx({ [className]: true })}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
    >
      {children}
    </div>
  );
};
