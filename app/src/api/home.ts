import axios from 'axios';
import { ApiHost } from '../constant';
import { TValidateUser } from './interface';

export const getHome: TValidateUser = () => axios.get(`${ApiHost}/home/list`);
