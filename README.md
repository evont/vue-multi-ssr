 ## 前言

一直以来都有很多关于SSR 和同构的文章，但大多都解决不了我在实践上的问题，比如，如何做到多页面支持SSR，如果比较优雅地实现同构等问题，大多数文章都只是提及了基础方案。由此我就萌生了解决这些问题的想法并实践了。以Vue 搭配Koa2 为例，围绕几个点来说说一些心得。

本文代码均以放在[我的示例项目](https://github.com/evont/vue-multi-ssr) 中，如果有需要参考的可以拉到本地后先执行`npm run build` 后`npm run start` 查看。

---

### 多页面SSR

大多数时候，单页面SSR 都可以满足需求，但是如果有时候需要到多页面，比如根据访问请求决定呈现移动端或PC端版本页面，或者有些业务拆分等，这样单页面SSR 就不再能满足需求了。同时，我希望可以对部分页面自由切换SSR与否，也希望支持在超时或错误时降级走客户端渲染。那么，要如何去实现这一切呢？

为了实现这一点，我的做法是，通过以下的目录结构，然后在遍历入口时判断是否有`entry-server.js`，如果有的话就进行SSR 打包，否则走客户端渲染，假如希望按项目划分，这个入口就可以作为项目入口点配置`vue-router`，比如希望PC端走ssr 而移动端走客户端渲染，那在koa 路由中按实际需求使用不同路由，然后如果项目需要用到`vue-router` ，则只要设置`base`即可。

```javascript
// router
router.get('/', ctrl.home);
router.get('/mobile/*', ctrl.mobile);
router.get('/pc/*', ctrl.pc);
```

项目的目录结构例子如下：

```
|-- components
|-- views
    |-- pc
        |-- App.vue
        |-- entry-client.js
        |-- entry-server.js
    |-- mobile
        |-- pages
            |-- page1
            |-- page2
        |-- App.vue
        |-- entry-client.js
|-- util
|-- ...
```

然后开始遍历入口：

```javascript
const fse = require('fs-extra');
// ...
const entryMap = {};
const pageRoot = path.resolve(process.cwd(), `./src/views`);
const tpl = path.resolve(process.cwd(), `./index.html`);
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
          template: tpl
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
```

这样我们就得到了所有页面的配置信息，对于浏览器端渲染按照普遍做法导入entry 和加入`HtmlWebpackPlugin` 和`VueSSRClientPlugin` 即可，但这样在多页面SSR项目中，`VueSSRClientPlugin` 会让所有entry 生成的js 都渲染到页面中，导致页面出错。这个时候就需要分多次打包，且建议先打包SSR 再打包客户端，避免一些意外错误。脚本的粗略不完整代码如下：

```javascript
// run-webpack.js
// 这部分只是一个简单的为了进行webpack 打包的脚本
const webpack = require('webpack');
function runCompiler(compiler) {
  return new Promise((res, rej) => {
    compiler.run((err, stats) => {
      showStats(stats);

      if (err || (stats && stats.hasErrors())) {
        rej(red(`Build failed! ${err || ''}`));
      }

      res(stats);
    });
  });
}
async function runWebpack(conf) {
  const compiler = webpack(conf);
  await runCompiler(compiler);
}

// 每个SSR 入口都需要单独打包，否则会让其他入口的代码都被打包进去，导致错误
async function buildSSRItem(data) {
  try {
    const confServer = await webpackVueSSRConfig(
      data.serverEntry,
      data.fileBase
    );
    await runWebpack(confServer);
    const confClient = await webpackVueConfig(isProd, false, {
      data,
      entry: {
        [data.name]: data.entry
      },
      plugins: [
        new VueSSRClientPlugin({
          filename: `../dist/views/${data.fileBase}/vue-ssr-client-manifest.json`
        })
      ]
    });
    await runWebpack(confClient);
  } catch (e) {
    console.log(e);
  }
}
async function buildSSR(entryMap) {
  try {
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
// 这部分好理解，只打包客户端代码
async function buildVue(entryMap) {
  try {
    const conf = await webpackVueConfig({
      entryMap
    });
    await runWebpack(conf);
  } catch (e) {
    console.log(e);
  }
}

async function build() {
  const entryMap = await entries();
  await buildSSR(entryMap);
  await buildVue(entryMap);
}

```

打包完成后就能得到以下结构，至此，我们就可以根据路由来渲染页面了
```
|-- views
    |-- mobile
        index.html
        vue-ssr-client-manifest.json
        vue-ssr-server-bundle.json
    |-- pc
        index.html
```


### 灵活开关SSR

完成了上面的步骤之后，我们已经有了多页面项目了，这个时候其实还没有说到如何走渲染。在用户访问时，如果需要传统的客户端渲染，只将上面单个项目目录下的index.html 返回给用户即可。如果需要SSR 渲染时，只需要访问项目目录下打包出来的json 然后渲染之后通过 `renderer.renderToString` 返回给用户也就完成了。

那么在这个时候，要实现灵活开关SSR，就只要在服务端访问时，自由根据需求开关切换渲染方式就可以了，以我的项目为例，我在koa 的context 上绑定了渲染方法，在单个路由中只需要从上下午的渲染方式中配置就可以了，如下：
```javascript
function bindRender(app) {
  app.context.renderView = async function(options) {
    const {
      name,
      isssr = false // ssr 开关
    } = options;

    const context = this;
    // 如果需要ssr 就进入此入口
    if (isssr) {
      const bundle = require(path.join(
        ssrPath,
        name,
        'vue-ssr-server-bundle.json'
      ));
      const clientManifest = require(path.join(
        ssrPath,
        name,
        'vue-ssr-client-manifest.json'
      ));
      const renderer = createRenderer(bundle, {
        template: ssrTpl,
        clientManifest
      });
      await render(renderer, 'ssrdemo', context);
    } else {
    // 进行传统的ejs 或任何你喜欢的方式
      const ejsName = `${name}/index`
      await context.render(ejsName, {
        layout: false
      });
    }
  };
}
// server

// ...
const app = new Koa();
bindRender(app);
// ...
const router = koaRouter();
router.get('/pc/*', async (ctx) => {
  const isssr = isSSRLogic(); // 决定是否开启SSR 的判断，比如根据是否登陆之类的
  await ctx.renderView({
    name: 'pc',
    isssr
  });
});
```
  
### 优雅解决同构问题

#### why

在我翻阅参考资料的时候，很多文章都只止步于基础配置及获取数据存储和渲染的问题，但是实际上项目里要用到的逻辑并不仅限于此。
比如在服务端渲染的时候，假如你需要根据Cookies 或UA作为渲染判断条件，在呈现给用户之前就已经渲染，而不是在用户端渲染。

同时，多数的实现方式都是通过类似`isBrowser`的方式判断然后去执行一些操作，这样的方式不好拓展也比较容易引起冗余，不够优雅。

更甚者，如果希望以后这些能力可以拓展到其他平台上，或者在不同的平台上引入不同的实现方式等，那么我们就需要考虑如何设计一套通用的SDK了。

#### What

既然要实现一套通用SDK，那么首先会想到抽象代码，所有平台代码都需要被约束实现同样的api，为了协定这些，我们就需要用接口来规定api 的实现，返回类型等，因此，typescript 成了最佳选择。

#### How

一般来说，这套SDK 只需要一个承载所有api 的普通对象就可以完成，但由于服务端渲染 时有请求的应用上下文概念，即每个请求都应该要独立，如果每次创建实例时都创建一个全新的上下文环境来执行代码，可以不考虑这一问题，但是这样性能消耗太大，不推荐，但如果共用一个环境的话，都应该经过实例化以避免相互污染。另外，在不同平台上实现这套SDK时，通常不会希望重复实现一些不需要重复实现的代码，只需要关心特定平台所需要的东西。

综上，我们需要两个东西：一个接口`interface`，用于协定基类及平台代码的范式；一个基类`class`，这一基类用于被不同平台实现继承，包含了平台无关的代码，如配置、通用判断等，还包含了一些默认实现，在被继承的平台不关心也不需要实现时给予默认值避免调用错误；

举个例子，如果你需要浏览器、服务端，甚至小程序端都能拥有`cookies`、`href`、`userAgent`等常用方法（尽管平台不一定真的有这一能力），也希望执行`Toast`这一类代码时不用再重复判断环境，那么可以先编写一个接口和基类：
```javascript
// common/interface.ts
type TCookie = {
  set: (name: string, value: string, option?: cookieOption) => void;
  get: (name: string) => string;
  remove: (name: string) => void;
};
// 省略其他类型定义
export interface IKit {
    Cookie: TCookie;
    Config: IConfig;
    Env: IEnv;
}

// common/index.ts
class Kit implements IKit {
    Cookie;
    Config: {
        // ...
    };
    Env: {
        // ...
    }
}
```
然后浏览器端和服务端就可以各自实现了：
```javascript
// browser/index.ts
import _Kit from "../common/index.ts";
const cookies = {
    set(name, value, options) {
        //...
        document.cookie = cookie;
    },
    get(name) {
        // ...
        return value;
    },
    remove(name) {
        cookies.set(name, '', {
            expires: Date.now() - 24 * 60 * 60 * 1000
        });
    }
}
class Kit extends _Kit {
    // ...
    Cookie = cookies;
}

// server/index.ts
import _Kit from "../common/index.ts";
class Kit extends _Kit {
    // 服务端需要传入应用上下文，每个应用都拿到自己专属的sdk，避免了污染
    constructor(context) {
        super();
        this.Cookie = {
          set(name, value, option = {}) {
            context.cookies.set(
              name,
              value,
              Object.assign(
                {},
                {
                  httpOnly: false,
                  secure: false,
                  // ...
                },
                option
              )
            );
          },
          get(name) {
            return context.cookies.get(name);
          },
          remove(name) {
            context.cookies.set(name, '', {
              expires: Date.now() - 1 * 24 * 60 * 60 * 1000
            });
          }
        };
    }
}
```
如上，我们就完成各自平台的api实现，在我们引入代码时，可以通过在webpack 里面设置不同的`alias` 来引入即可
```javascript
// webpack.client.config.js
//...
 resolve: {
    alias: {
        '@MyKit': './my-kit/browser'
    }
  },
// webpack.server.config.js
//...
 resolve: {
    alias: {
        '@MyKit': './my-kit/server'
    }
  },
```

到此就完成了大多数工作了，但是这个时候你会发现，由于每个SSR 项目都是单独打包的，所以都会将kit 代码包裹进去，如果kit 代码十分庞大，且拥有多个SSR 项目，就变得十分冗余庞重，为了解决这个问题，其实有个方式就是，将Kit 代码在服务端引用并注入到代码中，这样只需引用一次即可。


---

### 结语

以上所叙的代码都可以在[我的示例项目](https://github.com/evont/vue-multi-ssr) 中找到，写得比较粗糙。希望可以帮到和我一样有多页SSR 甚至希望拓展多端打包需求的朋友。