import _Kit from '../common/index';
import Api from './api';
export default class Kit extends _Kit {
  constructor(context) {
    super();
    const Cookie = {
      set(name, value, option = {}) {
        context.cookies.set(
          name,
          value,
          Object.assign(
            {},
            {
              httpOnly: false,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
              secure: false
            },
            option
          )
        );
      },
      get(name) {
        return context.cookies.get(name);
      },
      remove(name) {
        context.cookies.set(name, '', {
          expires: Date.now() - 1 * 24 * 60 * 60 * 1000
        });
      }
    };
    this.env = {
      userAgent: context ? context.headers['user-agent'] : ''
    }
    this.Cookie = Cookie;
    const api = new Api({ context });
    this.Api = api;
  }
}