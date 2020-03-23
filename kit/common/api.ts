import { IApi } from "./interface";

export const methods = ['GET', 'POST', 'PUT'];
export default class Api implements IApi {
  get(
    url: string,
  ) {
    return Promise.resolve()
  }
  post(
    url: string,
  ) {
    return Promise.resolve()
  }
  put(
    url: string,
  ) {
    return Promise.resolve()
  }
}