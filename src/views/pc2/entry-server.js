import App from './App.vue';
import VueKit from '@VueKit';
import { options, customInit } from './plugin';

export default VueKit.createSSR({
  App,
  options,
  customInit
});
