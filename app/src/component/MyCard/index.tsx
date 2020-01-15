import React, { ReactElement } from 'react';
import styles from './style.module.scss';
import cx from 'classnames';

export interface ICardProps {
  noteRender?: () => ReactElement | string;
  title: string | ReactElement;
  trigger: 'click' | 'hover' | 'focus';
  cardToggle?: (cardStatus: boolean, changeStatus: () => void) => void;
}

export type TCardSlidUp = () => void;

interface ICardState {
  showContent: boolean;
}

export class MyCard extends React.Component<ICardProps, ICardState> {
  constructor(props: any) {
    super(props);
    this.state = {
      showContent: false
    };
  }

  toggleShow = () => {
    const { showContent } = this.state;
    const { cardToggle } = this.props;
    if (cardToggle) {
      cardToggle(showContent, this.toggleCard);
    } else {
      this.toggleCard();
    }
  };

  closeToggle = () => {
    this.setState({ showContent: false });
  };

  toggleCard = () => {
    const { showContent } = this.state;
    this.setState({ showContent: !showContent });
  };

  getTriggerEvent = () => {
    const { trigger } = this.props;

    const eventName = `on${trigger.toUpperCase().substr(0, 1) +
      trigger.slice(1)}`;
    return {
      [eventName]: this.toggleShow
    };
  };

  public render() {
    const {
      title,
      noteRender,
      trigger,
      children,
      cardToggle,
      ...res
    } = this.props;

    const triggerEvent = this.getTriggerEvent();

    return (
      <>
        <div className={styles.wrapper} tabIndex={1} {...triggerEvent} {...res}>
          <div className={styles.title}>{title}</div>
          <div
            className={cx({
              [styles.briefNote]: true
              // [styles.briefDispear]: this.state.showContent
            })}
          >
            {noteRender && noteRender()}
          </div>
          <div
            className={cx({
              [styles.content]: true,
              [styles.showContent]: this.state.showContent
            })}
          >
            {typeof children === 'function' &&
              children({ slideUp: this.closeToggle })}
          </div>
        </div>
      </>
    );
  }
}
