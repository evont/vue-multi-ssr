module.exports = {
  mobile: async ctx => {
    await ctx.renderView({
      name: "mobile"
    });
  },
  pc: async ctx => {
    await ctx.renderView({
      name: "pc",
      isssr: true
    });
  },
  home: async ctx => {
    ctx.body = "home page";
  }
};
