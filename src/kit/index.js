import Vue from 'vue';
import Kit from '@Kit';
const isBrowser = !!(typeof window !== 'undefined' && window);
let __Vue;
const kitPlugin = {
  install(_Vue) {
    if (__Vue && _Vue === __Vue) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[VueKit] already installed. Vue.use(VueKit) should be called only once.'
        );
      }
      return;
    }
    __Vue = _Vue;
    function kitInit() {
      const options = this.$options;
      // kit 注入
      if (options.kit) {
        this.$kit =
          typeof options.kit === 'function' ? options.kit() : options.kit;
      } else if (options.parent && options.parent.$kit) {
        // 子组件从其父组件引用 $kit 属性
        this.$kit = options.parent.$kit;
      }
    }

    _Vue.mixin({
      data() {
        return { store: {} };
      },
      created() {
        if (this.$store) {
          this.store = this.$store;
        }
      },
      beforeCreate: kitInit
    });
  }
};

export default class VueKit {
  static createKit(ctx) {
    const Ctor = ctx && ctx.Kit || Kit;
    return new Ctor(ctx && ctx.context);
  }
  static createApp({ App, ctx, $store, plugins = [], options = {} }) {
    Vue.use(kitPlugin);
    let store;
    if ($store) {
      store = $store;
    } else if (isBrowser && window.__INITIAL_STATE__) {
      store = window.__INITIAL_STATE__;
    } else {
      store = {};
    }
    if (plugins && plugins.length) {
      plugins.forEach(item => {
        Vue.use(item)
      });
    }
    const app = new Vue({
      provide: {
        $store: store
      },
      kit: VueKit.createKit(ctx),
      ...options,
      render: h => h(App)
    });
    return app;
  }
  static createSSR({ App, cb }) {
    Vue.use(kitPlugin);
    return ctx => {
      return new Promise((resolve, reject) => {
        const kit = VueKit.createKit(ctx);
        if (App.asyncData) {
          Promise.resolve(App.asyncData(kit))
            .then(result => {
              ctx.state = result;
              try {
                cb && cb(ctx, result);
              } catch (err) {
                reject(err);
              }
              resolve(
                VueKit.createApp({
                  App,
                  Vue,
                  ctx,
                  $store: result
                })
              );
            })
            .catch(err => {
              // 请求超时则不再服务端渲染
              if (/timeout/i.test(err.message)) {
                resolve(
                  VueKit.createApp({
                    App,
                    Vue,
                    ctx
                  })
                );
              } else {
                reject(err);
              }
            });
        } else {
          resolve(
            VueKit.createApp({
              App,
              Vue,
              ctx
            })
          );
        }
      }).catch(error => {
        return Promise.reject(error);
      });
    };
  }
}
