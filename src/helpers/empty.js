module.exports = (options) => {
  if (options.hash && Object.keys(options.hash).length) {
    return options.fn(options.hash);
  }
  return options.inverse(this);
};
