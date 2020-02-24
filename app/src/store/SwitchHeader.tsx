import React, { createContext, useState } from "react";

interface Props {
  headerRender: () => JSX.Element;
}

export interface IHeaderControl {
  showHeader: () => void;
  hiddenHeader: () => void;
}

export const HeaderControl = createContext<IHeaderControl>({
  showHeader: () => {},
  hiddenHeader: () => {}
});

export const SwitchHeader: React.FC<Props> = props => {
  const { headerRender, children } = props;
  const [isShow, setShow] = useState<boolean>(true);

  const showHeader = () => setShow(true);
  const hiddenHeader = () => setShow(false);

  return (
    <HeaderControl.Provider
      value={{
        showHeader,
        hiddenHeader
      }}
    >
      <div style={{ display: isShow ? "block" : "none" }}>{headerRender()}</div>
      {/* 
      // @ts-ignore */}
      {children({showHeader, hiddenHeader})}
    </HeaderControl.Provider>
  );
};
