import App from './App.vue';
import VueKit from '@VueKit';
import { options, plugins } from './plugin';

export default VueKit.createSSR({
  App,
  plugins,
  options
});
