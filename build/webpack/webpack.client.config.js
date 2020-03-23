const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const util = require('../util');
const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');
// const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
// const webpack = require('webpack');
// const manifest = require('../manifest.json');
module.exports = async (isProd = false, watch = false, options = {}) => {
  const entries = await util.entries();
  const { entryMap } = entries;
  const entry = options.entry || entries.entry;
  const config = {
    entry,
    output: options.output || {
      path: path.resolve(process.cwd(), './web/public/'),
      publicPath: '/',
      filename: 'js/app/[name].js',
      chunkFilename: 'js/chunk/[name].js'
    },
    resolve: {
      alias: {
        '@DrKit': path.resolve(process.cwd(), './dr-kit/kit-ts/browser')
      }
    },
    plugins: [
      // new webpack.DllReferencePlugin({
      //   context: process.cwd(),
      //   manifest
      // }),
      new webpack.DefinePlugin({
        'process.env.VUE_ENV': '"client"'
      }),
      ...(isProd || !watch
        ? [
            new MiniCssExtractPlugin({
              filename: 'css/app/[name].css'
            })
          ]
        : [])
    ],
    optimization: options.optimization || {
      splitChunks: {
        cacheGroups: {
          vendors: {
            // 项目基本框架等
            chunks: 'initial',
            test: /node_modules/,
            priority: 100,
            name: 'chunk-vendors'
          },
          common: {
            name: 'chunk-components',
            chunks: 'initial',
            priority: 70,
            test: /vue\/components/,
            enforce: true,
            reuseExistingChunk: true,
            // minChunks: 2
          },
          kits: {
            // 项目基本框架等
            chunks: 'initial',
            test: /kit/i,
            priority: 80,
            name: 'dr-kit'
          }
        }
      }
    }
  };
  function getHtmlPlugin(data) {
    return new HtmlWebpackPlugin({
      template: data.template,
      templateParameters: data.templateParameters,
      filename: `../views/pages/${data.fileBase}/index.ejs`,
      inject: true,
      chunksSortMode: 'manual',
      chunks: ['chunk-vendors', 'dr-kit', 'chunk-components', data.name],
      minify: {
        removeComments: false,
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        processScripts: ['text/x-template']
      }
    });
  }
  if (options.plugins) {
    config.plugins = config.plugins.concat(options.plugins);
    // if (options.data) config.plugins.push(getHtmlPlugin(options.data));
  }
  if (!options.entry) {
    const newEntry = {};
    for (const i in entryMap) {
      const item = entryMap[i];
      newEntry[item.name] = item.entry;
      config.plugins.push(getHtmlPlugin(item));
      // config.plugins = config.plugins.concat(item.plugins);
    }
    config.entry = newEntry;
  }
  return merge(baseConfig({ isProd, watch }), config);
};
