const path = require("path");
const fse = require("fs-extra");
const { createBundleRenderer } = require("vue-server-renderer");
const LRU = require("lru-cache");

const Kit = require("../kit-js/kit/server").default;

function createRenderer(bundle, options) {
  return createBundleRenderer(
    bundle,
    Object.assign(options, {
      cache: new LRU({
        max: 1000,
        maxAge: 1000 * 60 * 15
      }),
      runInNewContext: false
    })
  );
}

async function render(renderer, title, ctx) {
  ctx.set("Content-Type", "text/html");
  await new Promise((resolve, reject) => {
    const context = {
      title,
      url: ctx.url,
      context: ctx,
      Kit
    };
    renderer.renderToString(context, (err, html) => {
      if (err) {
        reject(err);
      } else {
        resolve((ctx.body = html));
      }
    });
  }).catch(error => {
    // handle error
    console.error(error);
  });
}

const ssrPath = path.resolve(process.cwd(), `views`);
const ssrTpl = fse.readFileSync(path.resolve(process.cwd(), `index.html`), {
  encoding: "utf-8"
});
exports = module.exports = function(app) {
  if (app.context.renderView) {
    return;
  }
  app.context.renderView = async function(options) {
    const { name, isssr = false } = options;

    const context = this;
    if (isssr) {
      const bundle = require(path.join(
        ssrPath,
        name,
        "vue-ssr-server-bundle.json"
      ));
      const clientManifest = require(path.join(
        ssrPath,
        name,
        "vue-ssr-client-manifest.json"
      ));
      const renderer = createRenderer(bundle, {
        template: ssrTpl,
        clientManifest
      });
      await render(renderer, "ssrdemo", context);
    } else {
      const ejsName = `${name}/index`;
      await context.render(ejsName, {
        layout: false
      });
    }
  };
};
