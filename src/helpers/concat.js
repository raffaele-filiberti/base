module.exports = (...args) => args.slice(0, args.length - 1).reduce((acc, val = '') => acc.concat(val), '');
