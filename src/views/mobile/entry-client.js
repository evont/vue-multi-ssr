import App from './App.vue';
import VueKit from '@VueKit';
import VueRouter from 'vue-router';

let router = new VueRouter({
  routes: [
    { path: '/page1', component: () => import(/* webpackChunkName: "mobile-page" */'./pages/page1') },
    { path: '/page2', component: () => import(/* webpackChunkName: "mobile-page" */'./pages/page2') }
  ],
  mode:'history',
  base: 'mobile'
});

VueKit.createApp({
  App,
  plugins: [VueRouter],
  options: {
    router
  }
}).$mount('#app');