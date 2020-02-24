import React from "react";
import {} from "./index";

interface IWriterRefExpose {
  getHTMLContent: () => any;
}

export const Writer: React.FC<{
  myRef: React.Ref<any>;
  defaultValue?: string;
}>;

export const RefWriter: React.ForwardRefExoticComponent<{
  defaultValue?: string;
} & React.RefAttributes<IWriterRefExpose>>;
