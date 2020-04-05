import VueRouter from 'vue-router';
import Page1 from './pages/page1';
export let router = new VueRouter({
  routes: [
    { path: '/', component: Page1 },
    { path: '/page1', 
      component: Page1
    },
    { path: '/page2',
      component: () => import('./pages/page2'),
      children: [
        { path: '', component: () => import('./pages/page2/child') },
      ] 
    },
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
export const resolver = (ctx, kit) => {
  const { url } = ctx;
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
      Promise.all(matchedComponents.map(Component => {
        if (Component.asyncData) {
          return Component.asyncData(kit).then(data => ({
            name: Component.name,
            data
          }))
        }
      })).then(result => {
        const store = {};
        result.forEach(item => {
          if (item) store[item.name] = item.data;
        });
        resolve(store);
      })
    }, reject)
  })
}