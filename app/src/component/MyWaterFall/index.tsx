import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './style.module.scss';
import { reduce, debounce } from 'lodash';
import cx from 'classnames';

export interface IWaterfallProps {
  handleLoading?: (
    currEvent: number,
    resolve?: (value: boolean | PromiseLike<boolean>) => void,
    reject?: (value: any) => void
  ) => void;
  className?: string;
  scrollType?: 'global' | 'local';
  initPage?: number;
}

const MyWaterfall: React.FC<IWaterfallProps> = props => {
  const {
    children,
    className: wrapClass,
    handleLoading,
    scrollType = 'global',
    initPage = 0,
    ...res
  } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<number>(initPage);
  const [contentHeight, setContentHeight] = useState<number>(0);
  let [lastPageOffset, setLastHeight] = useState<number>(0);
  const [isLoading, setLoading] = useState<boolean>(false);

  const [notes, setNotes] = useState<string>('载入中.....');

  useEffect(() => {
    const { current } = wrapperRef;
    const { children } = current as HTMLDivElement;
    const height = reduce(
      children,
      (prev, current) => {
        const _h = prev + current.clientHeight;
        return _h;
      },
      0
    );
    setContentHeight(height);
  }, [pos]);

  // 监听整个页面scroll方法
  const _handleScroll = (scrollTop: number) => {
    const { current } = wrapperRef;
    const { offsetHeight } = current as HTMLDivElement;
    const { innerHeight, pageYOffset } = window;

    setLastHeight(pageYOffset);
    const isDown = pageYOffset - lastPageOffset > 0;

    if (scrollTop + innerHeight >= offsetHeight && isDown) {
      new Promise<boolean>((resolve, reject) => {
        setLoading(true);
        handleLoading && handleLoading(pos, resolve, reject);
      })
        .then(data => {
          setPos(pos + 1);
          setLoading(false);
        })
        .catch(data => {
          setNotes(data);
          setLoading(true);
        })
        .finally(() => {
          console.log('set false');
        });
    }
  };

  const debounced = debounce(_handleScroll, 500);
  // 内部scroll
  const handleScroll = useCallback(
    (event: Event) => {
      const height = document.documentElement.scrollTop;
      debounced(height);
    },
    [debounced, lastPageOffset]
  );

  useEffect(() => {
    scrollType === 'global' && window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pos, lastPageOffset]);

  return (
    <div
      ref={wrapperRef}
      className={cx({
        [styles.wrapper]: true,
        [wrapClass ? wrapClass : '']: true
      })}
      //@ts-ignore
      onScroll={scrollType === 'local' ? handleScroll : () => {}}
      {...res}
    >
      {children}
      <div
        className={styles.bottomTips}
        style={{ display: isLoading ? 'block' : 'none' }}
      >
        {notes}
      </div>
    </div>
  );
};

export { MyWaterfall };
