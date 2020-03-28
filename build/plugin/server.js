'use strict';

/*  */

var isJS = function (file) { return /\.js(\?[^.]+)?$/.test(file); };

var ref = require('chalk');
var red = ref.red;
var yellow = ref.yellow;

var prefix = "[vue-server-renderer-webpack-plugin]";
var warn = exports.warn = function (msg) { return console.error(red((prefix + " " + msg + "\n"))); };
var tip = exports.tip = function (msg) { return console.log(yellow((prefix + " " + msg + "\n"))); };

var validate = function (compiler) {
  if (compiler.options.target !== 'node') {
    warn('webpack config `target` should be "node".');
  }

  if (compiler.options.output && compiler.options.output.libraryTarget !== 'commonjs2') {
    warn('webpack config `output.libraryTarget` should be "commonjs2".');
  }

  if (!compiler.options.externals) {
    tip(
      'It is recommended to externalize dependencies in the server build for ' +
      'better build performance.'
    );
  }
};

var onEmit = function (compiler, name, hook) {
  if (compiler.hooks) {
    // Webpack >= 4.0.0
    compiler.hooks.emit.tapAsync(name, hook);
  } else {
    // Webpack < 4.0.0
    compiler.plugin('emit', hook);
  }
};

var VueSSRServerPlugin = function VueSSRServerPlugin (options) {
  if ( options === void 0 ) options = {};

  this.options = Object.assign({
    filename: 'vue-ssr-server-bundle.json'
  }, options);
};

VueSSRServerPlugin.prototype.apply = function apply (compiler) {
  var this$1 = this;

  validate(compiler);

  onEmit(compiler, 'vue-server-plugin', function (compilation, cb) {
    var stats = compilation.getStats().toJson();
    var entryName = Object.keys(stats.entrypoints)[0];
    var entryInfo = stats.entrypoints[entryName];
    var entryKey = this$1.options.key;
    // var chunks = this$1.options.chunks;
    // let entryAssets;;
    if (entryKey)  {
      // stats.entrypoints = {
      //   [entryKey]: stats.entrypoints[entryKey]
      // };
      entryInfo = stats.entrypoints[entryKey];
    }
    // console.log(entryKey, entryInfo)
    if (!entryInfo) {
      // #5553
      return cb()
    }

    var entryAssets = entryInfo.assets.filter(isJS);
    if (entryAssets.length > 1) {
      throw new Error(
        "Server-side bundle should have one single entry file. " +
        "Avoid using CommonsChunkPlugin in the server config."
      )
    }

    var entry = entryAssets[0];
    if (!entry || typeof entry !== 'string') {
      throw new Error(
        ("Entry \"" + entryName + "\" not found. Did you specify the correct entry option?")
      )
    }

    var bundle = {
      entry: entry,
      files: {},
      maps: {}
    };
    var chunkMap = {};
    stats.chunks.forEach(function (chunk) {
      chunkMap[chunk.id] = chunk;
    })
    // console.log(stats.assets, chunkMap, entry)
    var filename = this$1.options.filename;
    stats.assets.forEach(function (asset) {
      const chunkId = asset.chunks[0];
      if (chunkMap[chunkId] && chunkMap[chunkId].parents && chunkMap[chunkId].parents.length) {
        const parentId = chunkMap[chunkId].parents[0];
        asset.parent = chunkMap[parentId].files[0];
        console.log(asset.parent);
      }
      if (isJS(asset.name) && (new RegExp(entry).test(asset.name) || (asset.parent && asset.parent === entry))) {
        bundle.files[asset.name] = compilation.assets[asset.name].source();
        delete compilation.assets[asset.name];
      } else if (asset.name.match(/\.js\.map$/)) {
        bundle.maps[asset.name.replace(/\.map$/, '')] = JSON.parse(compilation.assets[asset.name].source());
        delete compilation.assets[asset.name];
      }
     
    });

    var json = JSON.stringify(bundle, null, 2);

    compilation.assets[filename] = {
      source: function () { return json; },
      size: function () { return json.length; }
    };

    cb();
  });
};

module.exports = VueSSRServerPlugin;