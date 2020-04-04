import VueRouter from 'vue-router';
import Page1 from './pages/page1';
export let router = new VueRouter({
  routes: [
    { path: '/', component: Page1 },
    { path: '/page1', component: Page1 },
    { path: '/page2', component: () => import('./pages/page2') },
    { path: '/page3', component: () => import('./pages/page3') },
    { path: '*',  component: () => import('./pages/404')},
  ],
  fallback: false,
  mode:'history',
  base: '/pc2'
});

export const plugins = [VueRouter];
export const options = {
  router
}
export const customInit = ({ 
  VueKit,
  Vue,
  opt,
  kit,
  cb,
}) => {
  Vue.use(VueRouter);
  let app = VueKit.createApp(opt);
  // console.log(router);
  const { url } = opt.ctx;
  let serverUrl = url;
  // 兼容SSR 模式下，vue-router 不支持base 导致路由404的问题
  const { base } = router.options;
  if (base && serverUrl.indexOf(base) === 0) {
    serverUrl = serverUrl.slice(base.length)
  }
  router.push(serverUrl);
  const { fullPath } = router.resolve(url).route;
  if (fullPath !== url) {
    return reject({ url: fullPath })
  }
  
  return new Promise((resolve, reject) => {
    router.onReady(() => {
      let matchedComponents = router.getMatchedComponents();
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }
      matchedComponents = matchedComponents[0];
      if (matchedComponents && matchedComponents.asyncData) {
        Promise.resolve(matchedComponents && matchedComponents.asyncData(kit)).then(result => {
          opt.ctx.state = result;
          try {
            cb && cb(opt.ctx, result);
          } catch (err) {
            reject(err);
          }
          app.setStore(result);
          resolve(app);
        }).catch(err => {
          // 请求超时则不再服务端渲染
          if (/timeout/i.test(err.message)) {
            resolve(
              VueKit.createApp(opt)
            );
          } else {
            reject(err);
          }
        });
      } else {
        resolve(app);
      }
    }, reject)
  })
}