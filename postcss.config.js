module.exports = ctx => ({
  plugins: {
    cssnano: ctx.env === 'production' ? {} : false
  }
});
