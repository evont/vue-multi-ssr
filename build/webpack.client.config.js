const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const baseConfig = require("./webpack.base.config");
const VueSSRClientPlugin = require("./plugin/client");
module.exports = async (options = {}) => {
  const { entryMap } = options;

  const config = {
    output: options.output || {
      path: path.resolve(process.cwd(), "./public/"),
      publicPath: "/",
      filename: "js/app/[name].js",
      chunkFilename: "js/chunk/[name].js"
    },
    resolve: {
      alias: {
        "@Kit": path.resolve(process.cwd(), "./kit/browser")
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.VUE_ENV": '"client"'
      }),
      new MiniCssExtractPlugin({
        filename: "css/app/[name].css"
      })
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            // 项目基本框架等
            chunks: "initial",
            test: /node_modules/,
            priority: 100,
            name: "chunk-vendors"
          },
          kits: {
            // 项目基本框架等
            chunks: "initial",
            test: /kit/i,
            priority: 80,
            name: "kits"
          }
        }
      }
    }
  };
  function getHtmlPlugin(data) {
    return new HtmlWebpackPlugin({
      template: data.template,
      filename: `../views/${data.fileBase}/index.html`,
      inject: true,
      chunksSortMode: "manual",
      chunks: ["chunk-vendors", "kits", data.name]
    });
  }
  if (options.plugins) {
    config.plugins = config.plugins.concat(options.plugins);
  }
  let newEntry = options.entry || {};
  if (!options.entry) {
    for (const i in entryMap) {
      const item = entryMap[i];
      newEntry[item.name] = item.entry;
      config.plugins.push(getHtmlPlugin(item));
      if (item.hasSSR) {
        config.plugins.push(
          new VueSSRClientPlugin({
            key: item.name,
            chunks: ["chunk-vendors", "kits", item.name],
            filename: `../views/${item.fileBase}/vue-ssr-client-manifest.json`
          })
       )
      }
    }
  }
  config.entry = newEntry;

  return merge(baseConfig(), config);
};
