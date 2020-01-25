import axios from "axios";
import { ApiHost } from "../constant";
import { TValidateUser, TGetUndoList, TGetSearchKey } from "./interface";

const URL = `${ApiHost}/home`;

export const getHome: TValidateUser = () => axios.get(`${URL}/list`);
export const getUndoList: TGetUndoList = userId =>
  axios.get(`${URL}/getUndoList`, {
    params: {
      userId
    }
  });

export const getSearchKey: TGetSearchKey = (
  keyword,
  pageSize = 5,
  pageNumber = 1,
  userId
) =>{
  return   axios.get(`${URL}/getSearchKey`, {
    params: {
      keyword,
      pageSize,
      pageNumber,
      userId
    }
  });
}

