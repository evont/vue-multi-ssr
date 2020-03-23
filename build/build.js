const glob = require('glob');
const path = require('path');
const fse = require('fs-extra');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const runWebpack = require("../run-webpack");

const webpackVueConfig = require('./webpack.client.config');
const webpackVueSSRConfig = require('./webpack.server.config');


async function entries() {
  const entryMap = {};
  const pageRoot = path.resolve(process.cwd(), `./src/views/`);
  await new Promise((resolve, reject) => {
    glob(`${pageRoot}/**/entry-client.js`, (err, files) => {
      err && reject(err);
      files.forEach(item => {
        const fileBase = item
          .replace(`${pageRoot}/`, '')
          .replace('/entry-client.js', '');
        const name = fileBase.replace(/\//g, '-');

        const serverEntry = item.replace('client', 'server');
        const hasSSR = fse.existsSync(serverEntry);
        const result = {
          name,
          entry: item,
          template: path.resolve(process.cwd(), `./index.html`),
          fileBase,
          hasSSR
        };
        if (hasSSR) {
          result.serverEntry = serverEntry;
        }
        entryMap[name] = result;
      });
      resolve(entryMap);
    });
  });
  return entryMap;
}

async function buildSSRItem(data) {
  try {
    const confServer = await webpackVueSSRConfig(
      data.serverEntry,
      data.fileBase
    );
    await runWebpack(confServer);
    const confClient = await webpackVueConfig({
      data,
      entry: {
        [data.name]: data.entry
      },
      plugins: [
        new VueSSRClientPlugin({
          filename: `../views/${data.fileBase}/vue-ssr-client-manifest.json`
        })
      ]
    });
    await runWebpack(confClient);
  } catch (e) {
    console.log(e);
  }
}
async function buildSSR() {
  try {
    const entryMap = await entries();
    for (const i in entryMap) {
      const item = entryMap[i];
      if (item.hasSSR) {
        await buildSSRItem(item);
      }
    }
  } catch (e) {
    console.log(e);
  }
}


async function buildVue() {
  try {
    const entryMap = await entries();
    const conf = await webpackVueConfig({
      entryMap
    });
    await runWebpack(conf);
  } catch (e) {
    console.log(e);
  }
}

async function build() {
  await buildSSR();
  await buildVue()
}

build();