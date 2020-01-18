import * as React from "react";

export interface IAppProps {
  asyncFunc: () => Promise<any>;
  loadFunc: (data: any) => () => React.ReactElement;
}

interface IState {
  Component: (() => React.ReactElement) | null;
}

export  class AsyncComponent extends React.Component<IAppProps, IState> {
  constructor(props: IAppProps) {
    super(props);
    this.state = {
      Component: null
    };
  }

  async componentDidMount() {
    const { asyncFunc, loadFunc } = this.props;

    const data = await asyncFunc();
    this.setState({
      Component: loadFunc(data)
    });
  }

  public render() {
    const { Component } = this.state;

    return <>{Component && <Component />}</>;
  }
}
