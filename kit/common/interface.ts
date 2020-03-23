type cookieOption = {
  expires?: number;
  domain?: string;
};
export type ICookie = {
  /**
   * 设置cookies
   */
  set: (name: string, value: string, option?: cookieOption) => void;
  get: (name: string) => string;
  remove: (name: string) => void;
};

type ApiConfig = {
  param?: any;
}
export interface IApi {
  // all: (requestArr: any[], callback: (...data: any[]) => void) => Promise<any>;
  get: (url: string, config?: ApiConfig) => Promise<any>;
  post: (url: string, config?: ApiConfig) => Promise<any>;
  put: (url: string, config?: ApiConfig) => Promise<any>;
}

export interface IKit {
  Cookie: ICookie;
  Api: IApi
}

export type IModalOption = {
  customClass?: string;
  callback?: (ele: Element) => void;
  loading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};
export interface IModal {
  confirm: (option: IModalOption) => any;
  alert: (option: IModalOption) => any;
}

export type IToastOption = {
  content: string;
  type: string;
}
export interface IToast {
  show: (options: string | IToastOption) => string;
  success: (options: string | IToastOption) => string;
  error: (options: string | IToastOption) => string;
  loading: (options: string | IToastOption) => string;
  hide: (toastid?: string) => void;
}