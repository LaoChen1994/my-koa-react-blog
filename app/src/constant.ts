import { IUserLink, ILinkMap, IUserState, IBlogTag } from './interface';

export const ApiHost = 'http://127.0.0.1:8000/api';
export const staticServer = 'http://127.0.0.1:8000';

export const initUserInfo: IUserState = {
  username: '',
  userId: -1,
  isLogin: false,
  avatarUrl: '',
  email: ''
};

const linkList: ILinkMap = {
  userCenter: {
    title: '用户中心',
    link: '/userCenter'
  },
  todoList: {
    title: '代办事项',
    link: '/todoList'
  },
  blog: {
    title: '我的博客',
    link: '/blog'
  },
  logout: {
    title: '登出',
    callback() {
      localStorage.removeItem('userToken');
      window.location.hash = '/login';
    }
  },
  fileCenter: {
    title: '文件中心',
    link: '/fileCenter'
  }
};

class LinkInfo {
  linkList: IUserLink[];

  constructor() {
    this.linkList = [];
  }

  getLinkList() {
    return this.linkList;
  }
}

export class LinkCreator extends LinkInfo {
  linkName: string;

  constructor(linkName: string) {
    super();
    this.linkName = linkName;
  }

  addLinkPage(name: string | string[]) {
    if (Array.isArray(name)) {
      name.map(elem => this.addLinkPage(elem));
    } else {
      linkList[name] && this.linkList.push(linkList[name]);
    }
    return this;
  }
}

export const transMap: { [keys: string]: string } = {
  Email: '电子邮件',
  blogNumber: '博文数量'
};

export const initTags: IBlogTag = {
  tagId: -1,
  tagName: '',
  userId: -1,
  articalNumber: 0
};
