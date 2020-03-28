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
  pc2: async ctx => {
    await ctx.renderView({
      name: "pc2",
      isssr: true
    });
  },
  home: async ctx => {
    ctx.body = "home page";
  }
};
