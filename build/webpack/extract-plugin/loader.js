'use strict';

const _module = require('module');
const _path = require('path');

const _loaderUtils = require('loader-utils');

const _NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');

const _NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');

const _LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin');

const _SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

const _LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin');

const MODULE_TYPE = 'any/extract';
const pluginName = 'extract-plugin';

const exec = (loaderContext, code, filename) => {
  const module = new _module(filename, loaderContext);
  module.paths = _module._nodeModulePaths(loaderContext.context); // eslint-disable-line no-underscore-dangle

  module.filename = filename;

  module._compile(code, filename); // eslint-disable-line no-underscore-dangle

  return module.exports;
};

function pitch(request) {
  const options = _loaderUtils.getOptions(this) || {};
  const loaders = this.loaders.slice(this.loaderIndex + 1);
  this.addDependency(this.resourcePath);
  const childFilename = '*'; // eslint-disable-line no-path-concat

  const publicPath =
    typeof options.publicPath === 'string'
      ? options.publicPath.endsWith('/')
        ? options.publicPath
        : `${options.publicPath}/`
      : typeof options.publicPath === 'function'
      ? options.publicPath(this.resourcePath, this.rootContext)
      : this._compilation.outputOptions.publicPath;
  const outputOptions = {
    filename: childFilename,
    publicPath
  };

  const childCompiler = this._compilation.createChildCompiler(
    `${pluginName} ${request}`,
    outputOptions
  );

  new _NodeTemplatePlugin(outputOptions).apply(childCompiler);
  new _LibraryTemplatePlugin(null, 'commonjs2').apply(childCompiler);
  new _NodeTargetPlugin().apply(childCompiler);
  new _SingleEntryPlugin(this.context, `!!${request}`, pluginName).apply(
    childCompiler
  );
  new _LimitChunkCountPlugin({
    maxChunks: 1
  }).apply(childCompiler); // We set loaderContext[MODULE_TYPE] = false to indicate we already in
  // a child compiler so we don't spawn another child compilers from there.

  childCompiler.hooks.thisCompilation.tap(
    `${pluginName} loader`,
    compilation => {
      compilation.hooks.normalModuleLoader.tap(
        `${pluginName} loader`,
        (loaderContext, module) => {
          // eslint-disable-next-line no-param-reassign
          loaderContext.emitFile = this.emitFile;
          loaderContext[MODULE_TYPE] = false; // eslint-disable-line no-param-reassign

          if (module.request === request) {
            // eslint-disable-next-line no-param-reassign
            module.loaders = loaders.map(loader => {
              return {
                loader: loader.path,
                options: loader.options,
                ident: loader.ident
              };
            });
          }
        }
      );
    }
  );
  let source;
  childCompiler.hooks.afterCompile.tap(pluginName, compilation => {
    source =
      compilation.assets[childFilename] &&
      compilation.assets[childFilename].source(); // Remove all chunk assets

    compilation.chunks.forEach(chunk => {
      chunk.files.forEach(file => {
        delete compilation.assets[file]; // eslint-disable-line no-param-reassign
      });
    });
  });
  const callback = this.async();
  childCompiler.runAsChild((err, entries, compilation) => {
    if (err) {
      return callback(err);
    }

    if (compilation.errors.length > 0) {
      return callback(compilation.errors[0]);
    }

    compilation.fileDependencies.forEach(dep => {
      this.addDependency(dep);
    }, this);
    compilation.contextDependencies.forEach(dep => {
      this.addContextDependency(dep);
    }, this);
    if (!source) {
      return callback(new Error("Didn't get a result from child compiler"));
    }

    let text;
    let locals;
    // let filename = this.resourcePath.replace(this.context, '');

    try {
      text = exec(this, source, request);
      locals = text && text.locals;
      // filename = filename.match(/\/(.+?)\..+?$/)[1];
      const ext = _path.extname(this.resourcePath);
      const filename = _path.basename(this.resourcePath, ext);
      text = {
        name: filename,
        type: ext.replace('.', ''),
        content: text
      };
      this[MODULE_TYPE](text);
    } catch (e) {
      return callback(e);
    }
    let resultSource = `// extracted by ${pluginName}`;
    if (locals && typeof resultSource !== 'undefined') {
      resultSource += `\nmodule.exports = ${JSON.stringify(locals)};`;
    }
    return callback(null, resultSource);
  });
}

exports.pitch = pitch;
