import axios, { Method } from 'axios';
import _Api, { methods } from '../common/api';

export default class Api extends _Api {
  constructor() {
    super();
    methods.forEach(item => {
      const method = <Method>item.toLowerCase();
      this[method] = function(
        url,
        params
      ) {
        return axios({
          method,
          url,
          params 
        }).then(res => res.data);
      };
    });
  }
}