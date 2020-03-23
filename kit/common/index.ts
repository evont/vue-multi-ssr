import {
  IApi,
  ICookie,
  IModal,
  IToast,
  IKit
} from './interface';
export default class Kit implements IKit {
  Cookie: ICookie;
  Api: IApi;
  env: {
    userAgent: string;
  }
  Toast: IToast = {
    show() {
      return '';
    },
    success() {
      return '';
    },
    error() {
      return '';
    },
    loading() {
      return '';
    },
    hide() {}
  };
  Modal: IModal = {
    confirm() {},
    alert() {}
  };
}