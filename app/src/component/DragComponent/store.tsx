import React, { createContext } from 'react';
import { HTMLStringTransfer } from '../../utlis/HtmlStringTrans';

const Factory = new HTMLStringTransfer();

export const DragContext = createContext<{ Factory: typeof Factory }>({
  Factory
});

export const DragStore: React.FC<{}> = props => {
  const { children } = props;

  return (
    <DragContext.Provider value={{ Factory }}>{children}</DragContext.Provider>
  );
};
