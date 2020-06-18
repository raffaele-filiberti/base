const path = require('path');
const postCssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');
const postCssImport = require('postcss-import');

module.exports = () => ({
  js: {
    include: path.resolve(__dirname, 'node_modules/@aquestsrl/dev-utils'),
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  },
  css: { modules: false },
  postcss: {
    plugins: (loader) => [
      postCssImport({ root: loader.resourcePath }),
      postCssPresetEnv({
        stage: 0,
        browsers: process.env.NODE_ENV === 'development' ? '> 3%' : null,
      }),
      cssnano({ preset: 'default' }),
    ],
  },
});
