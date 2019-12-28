import React, { useReducer, Dispatch, createContext } from 'react';

import { UserAction } from './interface';
import { initUserInfo } from '../constant'

type IUserState = typeof initUserInfo;

export const UserContext = createContext<{
  state: IUserState;
  dispatch: Dispatch<UserAction>;
}>({ state: initUserInfo, dispatch: value => {} });

const reducer = (state: IUserState, action: UserAction) => {
  switch (action.type) {
    case 'login':
      const {
        username = '',
        userId = -1,
        isLogin = false,
        avatarUrl = ''
      } = action.payload;
      return { ...state, username, userId, isLogin, avatarUrl };

    case 'logout':
      return { ...state, ...initUserInfo };

    default:
      return state;
  }
};

export const UserProvider: React.FC<{}> = props => {
  const { children } = props;

  const [state, dispatch] = useReducer(reducer, initUserInfo);

  return (
    <>
      <UserContext.Provider value={{ state, dispatch }}>
        {children}
      </UserContext.Provider>
    </>
  );
};
