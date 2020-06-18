const glob = require('glob');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackReloadPlugin = require('@aquestsrl/html-webpack-reload-plugin');
const HtmlWebpackDynamicTemplateParametersPlugin = require('@aquestsrl/html-webpack-dynamic-template-parameters-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const views = glob.sync('./src/views/**/*.hbs');

module.exports = () => ({
  plugins: [
    ...views.map(
      (template) => new HtmlWebpackPlugin({
        template,
        filename: path.basename(template).replace('.hbs', '.html'),
      }),
    ),
    ...views.map(
      (view) => new HtmlWebpackDynamicTemplateParametersPlugin({
        path: path.resolve(__dirname, view.replace('.hbs', '.json')),
        globalPath: path.resolve(__dirname, 'src', 'views', 'global.json'),
      }),
    ),
    process.env.NODE_ENV === 'production'
      ? new CopyPlugin([
        {
          from: './src/assets',
          to: 'assets',
        },
        {
          from: './src/partials/**/*.hbs',
          to: 'partials/',
          // transformPath: (targetPath) =>
          // `components/${targetPath.substring(targetPath.lastIndexOf('/') + 1)}`,
        },
        {
          from: './src/views/**/*.hbs',
          to: 'views/',
          // transformPath: (targetPath) =>
          // `views/${targetPath.substring(targetPath.lastIndexOf('/') + 1)}`,
        },
      ])
      : new CopyPlugin([
        {
          from: './src/assets',
          to: 'assets',
        },
      ]),
    process.env.NODE_ENV !== 'production' ? new HtmlWebpackReloadPlugin() : undefined,
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        options: {
          partialDirs: path.resolve(__dirname, 'src', 'partials'),
          helperDirs: path.resolve(__dirname, 'src', 'helpers'),
        },
      },
    ],
  },
});
