export interface IUserState {
  username: string;
  userId: string;
  email: string;
  isLogin: boolean;
  avatarUrl: string;
}

export type UserAction =
  | { type: 'login'; payload: Partial<IUserState> }
  | { type: 'logout' };


export interface IProviderProps {
  userInfo?: IUserState;
}