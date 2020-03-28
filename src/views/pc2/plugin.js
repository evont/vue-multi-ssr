import VueRouter from 'vue-router';
import Page1 from './pages/page1';
let router = new VueRouter({
  routes: [
    { path: '/page1', component: Page1 },
    { path: '/page2', component: () => import('./pages/page2') },
    { path: '/page3', component: () => import('./pages/page3') }
  ],
  mode:'history',
  base: 'pc2'
});

export const plugins = [VueRouter];
export const options = {
  router
}