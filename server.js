const Koa = require("koa");
const koaRouter = require("koa-router");
const render = require("koa-ejs");
const serve = require("koa-static");
const vueRenderer = require("./server/renderer");
const ctrl = require("./server/ctrl");
const app = new Koa();

const router = koaRouter();
router.get("/mobile/*", ctrl.mobile);
router.get("/pc/*", ctrl.pc);
router.get("/pc2/*", ctrl.pc2);
router.get("/", ctrl.home);
app.use(router.routes());

const viewRoot = "./views";
render(app, {
  root: viewRoot,
  layout: "../index",
  viewExt: "html"
});
vueRenderer(app);
app.use(serve("./public"));

app.listen(3000);
