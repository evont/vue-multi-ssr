const webpack = require("webpack");

// 可忽略可选配置
const SizePlugin = require("size-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
// ---

const VueLoaderPlugin = require("vue-loader/lib/plugin");
const vueLoaderConfig = require("./vue-loader.conf");

const util = require("./utils");
const path = require("path");

module.exports = (isServer = false) => ({
  mode: "production",
  module: {
    noParse: /es6-promise\.js$/,
    rules: [
      ...util.styleLoaders({
        sourceMap: true,
        extract: true,
        usePostCSS: true,
        isServer
      }),
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: vueLoaderConfig()
      },
      {
        test: /\.(html|ejs)$/,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: {
                removeComments: false,
                collapseWhitespace: false
              },
              attributes: false
            }
          }
        ]
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: [
                "syntax-dynamic-import",
                "@babel/plugin-proposal-class-properties"
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
            loader: "ts-loader"
          }
        ]
      }
    ]
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: "warning"
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          output: { comments: false },
          mangle: true,
          compress: {
            arrows: false,
            collapse_vars: false,
            comparisons: false,
            computed_props: false,
            hoist_funs: false,
            hoist_props: false,
            hoist_vars: false,
            inline: false,
            loops: false,
            negate_iife: false,
            properties: false,
            reduce_funcs: false,
            reduce_vars: false,
            switches: false,
            toplevel: false,
            typeofs: false,
            booleans: true,
            if_return: true,
            sequences: true,
            unused: true,
            conditionals: true,
            dead_code: true,
            evaluate: true,
            keep_fargs: false,
            pure_getters: true,
            pure_funcs: [
              "classCallCheck",
              "_classCallCheck",
              "_possibleConstructorReturn",
              "Object.freeze",
              "invariant",
              "warning"
            ]
          }
        },
        sourceMap: false,
        extractComments: false
      }),
      ...(!isServer
        ? []
        : [
            new OptimizeCssAssetsPlugin({
              cssProcessorOptions: {
                // Fix keyframes in different CSS chunks minifying to colliding names:
                reduceIdents: false
              }
            })
          ])
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".vue", ".scss", ".css", ".json"],
    alias: {
      vue: "vue/dist/vue.esm.js",
      "@VueKit": path.resolve(process.cwd(), "./src/kit")
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
        "\u001b[90m\u001b[44mBuild\u001b[49m\u001b[39m [:bar] \u001b[32m\u001b[1m:percent\u001b[22m\u001b[39m (:elapseds) \u001b[2m:msg\u001b[22m",
      renderThrottle: 100,
      summary: false,
      clear: true
    })
  ]
});
