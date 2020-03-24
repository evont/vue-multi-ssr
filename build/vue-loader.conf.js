const utils = require("./utils");

module.exports = (extract = true) => ({
  loaders: utils.cssLoaders({
    sourceMap: true,
    extract
  }),
  cssSourceMap: true,
  cacheBusting: true,
  transformToRequire: {
    video: ["src", "poster"],
    source: "src",
    img: "src",
    image: "xlink:href"
  }
});
