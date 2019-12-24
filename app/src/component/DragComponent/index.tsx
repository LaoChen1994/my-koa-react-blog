import React from 'react';
import style from './style.module.scss';
import cx from 'classnames';

interface Props {
  className?: string;
}

const index: React.FC<Props> = props => {
  const { children, className = '' } = props;

  return (
    <div className={cx({ [style.wrapper]: true, className: true })}>
      {children}
    </div>
  );
};

export default index;
