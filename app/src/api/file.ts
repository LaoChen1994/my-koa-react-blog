import axios from 'axios';
import { ApiHost } from '../constant';
import { TAddNewFile, TGetFileList, TAddDownloadNum } from './interface';

const URL = `${ApiHost}/file`;

export const addNewFile: TAddNewFile = (
  fileName,
  fileBrief,
  authorId,
  location
) =>
  axios.post(`${URL}/addNewFile`, {
    fileName,
    fileBrief,
    authorId,
    location
  });

export const getFileList: TGetFileList = (
  pageSize,
  pageNumber,
  userId = undefined
) =>
  axios.get(`${URL}/getFileList`, {
    params: {
      pageNumber,
      pageSize,
      userId
    }
  });

export const AddFileDownload: TAddDownloadNum = fileId =>
  axios.get(`${URL}/addDownload`, { params: { fileId } });
