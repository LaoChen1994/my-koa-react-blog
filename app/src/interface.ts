export type UserAction =
  | { type: 'login'; payload: IUserState }
  | { type: 'logout' };

export interface IUserState {
  username: string;
  userId: string;
  email: string;
  isLogin: boolean;
  avatarUrl: string;
}

export interface IUserLink {
  title: string;
  icon?: string;
  link?: string;
  callback?: () => void
}

export interface ILinkMap {
  [key: string]: IUserLink
}