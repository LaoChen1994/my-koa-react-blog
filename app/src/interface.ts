export type UserAction =
  | { type: 'login'; payload: IUserState }
  | { type: 'logout' };

export interface IBlogTag {
  tagId: number;
  tagName: string;
  userId: IUserState['userId'];
  articalNumber: number;
}

export interface IUserState {
  username: string;
  userId: number;
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