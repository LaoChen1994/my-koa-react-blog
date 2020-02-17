import React, { PureComponent } from "react";
import styles from './style.module.scss';

export default class componentName extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      scriptContent: ""
    };
  }

  render() {
    const { scriptContent } = this.props.blockProps;
    return <pre className={styles.code}>{scriptContent}</pre>;
  }
}
