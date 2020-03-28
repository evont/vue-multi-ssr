const webpack = require("webpack");
const merge = require("webpack-merge");
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");

const baseConfig = require("./webpack.base.config");

module.exports = (options = {}) => {
  const { entryMap, entry, dirname = '' } = options;
  const config = {
    target: "node",
    devtool: "#source-map",
    // entry,
    output: {
      path: path.resolve(process.cwd(), `./views/${dirname}`),
      filename: "server-bundle-[name].js",
      libraryTarget: "commonjs2"
    },
    externals: nodeExternals({
      whitelist: /\.css$/
    }),
    resolve: {
      alias: {
        "@Kit": path.resolve(process.cwd(), "./kit/server/mock")
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.VUE_ENV": '"server"'
      }),
      new VueSSRServerPlugin()
    ]
  };
  let newEntry = options.entry || {};
  // if (!options.entry) {
  //   for (const i in entryMap) {
  //     const item = entryMap[i];
  //     if (item.hasSSR) {
  //       newEntry[item.name] = item.entry;
  //       config.plugins.push(
  //         new VueSSRServerPlugin({
  //           key: item.name,
  //           filename: `../views/${item.fileBase}/vue-ssr-server-bundle.json`
  //         })
  //      )
  //     }
  //   }
  // }
  config.entry = newEntry;
  return merge(baseConfig(true), config);
};
