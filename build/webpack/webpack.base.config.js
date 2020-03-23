const webpack = require('webpack');
const SizePlugin = require('size-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const vueLoaderConfig = require('./vue-loader.conf');
const ExtractPlugin = require('./extract-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const extractLoader = ExtractPlugin.loader;
const util = require('./utils');
const path = require('path');

module.exports = () => ({
  mode: 'production',
  module: {
    noParse: /es6-promise\.js$/,
    rules: [
      ...util.styleLoaders({
        sourceMap: true,
        extract: true,
        usePostCSS: true
      }),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig(isProd, isServer, watch)
      },
      {
        test: /\.(html|ejs)$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true,
              removeComments: false,
              attrs: false
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              //name: '[path][name].[ext]',
              name: '[name]2.[ext]', //最后生成的文件名是 output.path+ outputPaht+ name，[name],[ext],[path]表示原来的文件名字，扩展名，路径
              //useRelativePath:true,
              outputPath: 'img/' // 后面的/不能少
            }
          }
        ]
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              // 如果有这个设置则不用再添加.babelrc文件进行配置
              presets: ['@babel/preset-env'],
              plugins: [
                'syntax-dynamic-import',
                '@babel/plugin-proposal-class-properties'
              ]
            }
          }
        ]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: isProd ? 'warning' : false
  },
  resolve: {
    extensions: ['.js', '.ts', '.vue', '.ejs', '.scss', '.css', '.json'],
    alias: {
      vue: 'vue/dist/vue.esm.js'
      // ...
    }
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new VueLoaderPlugin(),
    new FixStyleOnlyEntriesPlugin(),
    new SizePlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new ProgressBarPlugin({
      format:
        '\u001b[90m\u001b[44mBuild\u001b[49m\u001b[39m [:bar] \u001b[32m\u001b[1m:percent\u001b[22m\u001b[39m (:elapseds) \u001b[2m:msg\u001b[22m',
      renderThrottle: 100,
      summary: false,
      clear: true
    })
  ]
});
