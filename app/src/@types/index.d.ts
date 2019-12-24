import { IUserState } from '../store/interface';


declare global {
  interface Window {
    _global?: {
      userInfo?: Omit<IUserState, ''> ;
    };
  }
}