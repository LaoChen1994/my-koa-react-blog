import { IUserState, IBlogTag } from "../interface";
import { TNewTags } from "../component/TagsSelection/CloseTags";

export interface ICommonApiInterface<T> {
  data: T;
  status: 404 | 302 | 303 | 500 | 200 | 403 | 401;
}

export interface IStatus {
  status: boolean;
  msg: string;
  token: string;
}

export interface IData<T> {
  data: T;
}

export interface IBlogInfo {
  blogId: number;
  blogName: string;
  publishDate: Date;
  lastUpdateTime: Date;
  blogContent: string;
  authorId: number;
  tagsId: number[];
}

export interface IUserDetail {
  userId: number;
  Email: string;
  avatarUrl: string;
  blogNumber?: number;
  userName: string;
}

export interface IBlogListStatic {
  totalNumber: number;
}

export type TBlogBrief = IBlogInfo & {
  userName: IUserState["username"];
  avatarUrl?: string;
};

export type TGetUserDetail = (
  userId: number
) => Promise<ICommonApiInterface<IStatus & IData<IUserDetail>>>;

export type TUserLogin = (
  username?: string,
  password?: string
) => Promise<
  ICommonApiInterface<IStatus & { userInfo: Omit<IUserState, "isLogin"> }>
>;

export type TReturnData<T> = IStatus & IData<T>;

export interface ITodoInfo {
  userId: number;
  todoItem: string;
  startTime: Date;
  endTime: Date;
  isComplete: boolean;
  todoTitle: string;
  todoId: number;
  isExpire: boolean;
}

export interface IComment {
  commentId: number;
  authorId: number;
  commentItem: string;
  commentDate: string;
  belongId: null | number;
  belongText: number;
}

export interface IBlogContent {
  title: string;
  tags: TNewTags[];
  content: string;
}

export interface IFileInfo {
  fileName: string;
  publishDate: string;
  fileId: number;
  fileBrief: string;
  authoId: number;
  location: string;
  downloadNumber: number;
}

export type TAddTodoProps = Omit<ITodoInfo, "todoId" | "isExpire">;
export type TAddModifyProps = Omit<ITodoInfo, "userId" | "isExpire">;
export type TBlogDetailInfo = IBlogInfo & {
  tags: IBlogTag[];
  blogNumber: number;
} & Pick<IUserState, "avatarUrl" | "username">;
export type TFileListParams = Omit<IFileInfo, "authorId"> &
  Pick<IUserState, "userId" | "username" | "avatarUrl">;

export type TUserRegister = (
  username: string,
  password: string,
  email: string,
  phoneNumber: string,
  avartarUrl?: string
) => Promise<ICommonApiInterface<Omit<IStatus, "token">>>;

export type TValidateUser = () => Promise<
  ICommonApiInterface<IStatus & { userInfo: Omit<IUserState, "isLogin"> }>
>;

export type TCheckUsername = (
  username: string
) => Promise<ICommonApiInterface<Omit<IStatus, "token">>>;

export type TLoadFileRes = Omit<IStatus, "token"> &
  Pick<IUserState, "avatarUrl">;

export type TAddTodoItem = (
  e: TAddTodoProps
) => Promise<ICommonApiInterface<Omit<IStatus, "token">>>;

export type TModifyTodoItem = (
  e: TAddModifyProps
) => Promise<ICommonApiInterface<Omit<IStatus, "token">>>;

export type TGetTodoList = (
  userId: number
) => Promise<
  ICommonApiInterface<{ data: Omit<IStatus, "token"> & { data: ITodoInfo[] } }>
>;

export type TFinishItem = (
  todoId: number
) => Promise<ICommonApiInterface<IStatus>>;

export type TClearAll = (
  todoIds: number[]
) => Promise<ICommonApiInterface<IStatus>>;

export type TGetUndoList = (
  userId: number
) => Promise<ICommonApiInterface<IStatus & IData<{ undoList: ITodoInfo[] }>>>;

export type TGetSearchKey = (
  keyword: string,
  pageSize?: number,
  pageNumber?: number,
  userId?: number
) => Promise<
  ICommonApiInterface<
    IStatus & IData<{ blogList: TBlogBrief[] } & { totalNumber: number }>
  >
>;

export type TGetBlogList = (
  pageSize: number,
  currentPage: number,
  userId?: number
) => Promise<
  ICommonApiInterface<
    IStatus & IData<{ blogList: TBlogBrief[]; totalNumber: number }>
  >
>;

export type TGetCompleteList = (
  userId: number,
  type: boolean
) => Promise<ICommonApiInterface<IStatus & { data: ITodoInfo[] }>>;

export type TGetUserTags = (
  userId: number
) => Promise<ICommonApiInterface<Omit<IStatus, "token"> & IData<IBlogTag[]>>>;

export type TAddBlog = (
  userId: number,
  blogContent: IBlogContent
) => Promise<ICommonApiInterface<Omit<IStatus, "token">>>;

export type TModifyBlog = (
  blogId: number,
  blogName: string,
  blogContent: string,
  tagsId: TNewTags[],
  userId: number
) => Promise<ICommonApiInterface<Omit<IStatus, "token">>>;

export type TGetBlogDetail = (
  blogId: number
) => Promise<ICommonApiInterface<IStatus & IData<TBlogDetailInfo>>>;

export interface IUploadResponse {
  fileName: string;
  filePath: string;
  msg: string;
  status: boolean;
}

export type TAddComment = (
  authorId: number,
  commentItem: string,
  belongId: number | undefined,
  belongText: number
) => Promise<ICommonApiInterface<IStatus>>;

export type TUploadResponse = Omit<IStatus, "token"> & IData<IUploadResponse>;

export type TAddNewFile = (
  filename: string,
  fileBrief: string,
  authorId: number,
  location: string
) => Promise<ICommonApiInterface<IStatus>>;

export type TGetFileList = (
  pageSize: number,
  pageNumber: number,
  userId?: number
) => Promise<
  ICommonApiInterface<Omit<IStatus, "token"> & IData<TFileListParams[]>>
>;

export type TAddDownloadNum = (
  fileId: number
) => Promise<ICommonApiInterface<TReturnData<{}>>>;

export type TCommentType = IComment &
  Pick<IUserDetail, "userName" | "avatarUrl">;

export type TCommentList = TCommentType & { subCommentList: TCommentType[] }

export type TGetCommentList = (
  blogId: number,
  pageNumber?: number,
  pageSize?: number
) => Promise<
  ICommonApiInterface<
    IStatus & IData<{ commentList: TCommentList[]; totalNumber: number, pageNumber: number }>
  >
>;
