'use strict';

const MODULE_TYPE = 'any/extract';

const pluginName = 'extract-plugin';

class ExtractPlugin {
  constructor(options) {
    this.options = Object.assign(
      {
        holder: '<!--xtemplate-outlet-->',
        id: 'tpl_[name]',
        scriptType: 'x-template'
      },
      options
    );
  }
  apply(compiler) {
    const ejsArr = [];
    const { options } = this;
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.hooks.normalModuleLoader.tap(pluginName, lc => {
        const loaderContext = lc;

        loaderContext[MODULE_TYPE] = content => {
          ejsArr.push(content);
        };
      });
    });
    compiler.hooks.compilation.tap(pluginName, compilation => {
      function proceeFunc(htmlPluginData, callback) {
        htmlPluginData.html = htmlPluginData.html.replace(
          options.holder,
          ejsArr
            .map(item => {
              let idStr;
              if (typeof options.id === 'function') {
                const idFormat = options.id(item.type);
                if (typeof idFormat === 'string') {
                  idStr = idFormat.replace('[name]', item.name);
                } else {
                  throw new Error(
                    'you should return a String instead of anything else'
                  );
                }
              } else if (typeof options.id === 'string') {
                idStr = options.id.replace('[name]', item.name);
              }
              return `<script type="text/${
                options.scriptType
              }" id="${idStr}">${item.content.replace(/\\"/g, '"')}</script>`;
            })
            .join('')
        );
        if (callback) {
          callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      }
      if (compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing) {
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(
          pluginName,
          proceeFunc
        );
      }
    });
  }
}

ExtractPlugin.loader = require.resolve('./loader');

module.exports = ExtractPlugin;
