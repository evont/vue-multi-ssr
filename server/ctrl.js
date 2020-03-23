module.exports = {
  mobile: async (ctx) => {
    await ctx.renderView({
      name: 'mobile'
    });
  },
  pc: async (ctx) => {
    await ctx.renderView({
      name: 'pc',
      isssr: true
    });
  }
}