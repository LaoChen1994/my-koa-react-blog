import { IUserState } from '../store/interface';

export interface ICommonApiInterface<T> {
  data: T;
  status: 404 | 302 | 303 | 500 | 200 | 403 | 401;
}

export interface IStatus {
  status: boolean;
  msg: string;
  token: string;
}

export type TUserLogin = (
  username?: string,
  password?: string
) => Promise<
  ICommonApiInterface<IStatus & { userInfo: Omit<IUserState, 'isLogin'> }>
>;

export type TUserRegister = (
  username: string,
  password: string,
  email: string,
  phoneNumber: string,
  avartarUrl?: string
) => Promise<ICommonApiInterface<Omit<IStatus, 'token'>>>;

export type TValidateUser = () => Promise<
  ICommonApiInterface<IStatus & { userInfo: Omit<IUserState, 'isLogin'> }>
>;

export type TCheckUsername = (
  username: string
) => Promise<ICommonApiInterface<Omit<IStatus, 'token'>>>;

export type TLoadFileRes = Omit<IStatus, 'token'> &
  Pick<IUserState, 'avatarUrl'>;
