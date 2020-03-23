import request from "request";
import _Api, { methods } from '../common/api';

export default class Api extends _Api {
  constructor(context) {
    super();
    methods.forEach(item => {
      const method = item.toLowerCase();
      this[method] = function(
        url,
        params
      ) {
        return new Promise((resolve, reject) => {
          request({
            method,
            url
          }, function (error, response, body) {
            if (error) {
              reject(error);
            }
            resolve(JSON.parse(body));
          })
        })
      };
    });
  }
}