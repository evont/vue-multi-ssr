import App from './App.vue';
import VueKit from '@VueKit';
import { options, plugins } from './plugin';
VueKit.createApp({
  App,
  plugins,
  options
}).$mount('#app');