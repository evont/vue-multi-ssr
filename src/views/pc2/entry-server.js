import App from './App.vue';
import VueKit from '@VueKit';
import { options, plugins, resolver } from './plugin';

export default VueKit.createSSR({
  App,
  options,
  plugins,
  resolver
});
