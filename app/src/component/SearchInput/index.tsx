import React, { useState, useCallback } from "react";
import styles from "./style.module.scss";
import { Input, Icon, IInputChangeEvent } from "zent";
import { debounce } from "lodash";
import cx from 'classnames';

export interface IAppProps {
  placeholder?: string;
  fetchData?: (value: string) => void;
  fetchDataInEmpty?: () => void;
  delayTime?: number;
}

export const SearchInput: React.FC<IAppProps> = (props) => {
  const {
    placeholder = "",
    fetchData,
    delayTime = 500,
    fetchDataInEmpty,
    ...res
  } = props;
  const [value, setValue] = useState<string>("");

  const _fetchData = useCallback(
    debounce((value: string) => {
      if (value) {
        fetchData && fetchData(value);
      } else {
        fetchDataInEmpty && fetchDataInEmpty();
      }
    }, delayTime),
    [fetchData]
  );

  const _handleChange = (e: IInputChangeEvent) => {
    const { value } = e.target;
    setValue(value);
    _fetchData(value);
  };

  return (
    <div className={cx({[styles.wrapper]: true})} {...res}>
      <Icon
        type="search"
        style={{
          fontSize: "20px",
          marginRight: "10px",
          verticalAlign: "middle",
          color: "#333333"
        }}
      ></Icon>
      <div className={styles.inline}>
        <Input
          placeholder={placeholder}
          className={styles.search}
          value={value}
          onChange={_handleChange}
        ></Input>
      </div>
    </div>
  );
}
