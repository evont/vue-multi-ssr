const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const baseConfig = require('./webpack.base.config');

module.exports = (entry, dirname) => {
  const config = {
    target: 'node',
    devtool: '#source-map',
    entry,
    output: {
      path: path.resolve(process.cwd(), `./views/${dirname}/`),
      filename: 'server-bundle.js',
      libraryTarget: 'commonjs2'
    },
    externals: nodeExternals({
      whitelist: /\.css$/
    }),
    resolve: {
      alias: {
        '@Kit': path.resolve(process.cwd(), './kit/server/mock'),
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.VUE_ENV': '"server"'
      }),
      new VueSSRServerPlugin()
    ]
  };
  return merge(baseConfig(true), config);
};
