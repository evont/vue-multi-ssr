import _Kit from '../common/index';
import { cookies } from "./storage";
import Api from './api';
export default class Kit extends _Kit {
  constructor() {
    super();
  }
  Cookie = cookies;
  Api = new Api();
  env = {
    //@ts-ignore
    userAgent: navigator.userAgent
  }
}