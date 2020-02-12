import React, { createContext, useState } from "react";
import { HTMLStringTransfer } from "../../utlis/HtmlStringTrans";

const Factory = new HTMLStringTransfer();

export const DragContext = createContext<{
  Factory: typeof Factory;
  useDefaultMove: boolean;
  setUseMove: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  Factory,
  useDefaultMove: true,
  setUseMove: () => {}
});

export const DragStore: React.FC<{}> = props => {
  const { children } = props;
  const [useDefaultMove, setUseMove] = useState<boolean>(true);

  return (
    <DragContext.Provider value={{ Factory, useDefaultMove, setUseMove }}>
      {children}
    </DragContext.Provider>
  );
};
