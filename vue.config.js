const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssnanoPlugin = require('cssnano-webpack-plugin');
const HtmlMinifierPlugin = require('html-minifier-webpack-plugin');

module.exports = {
  configureWebpack: {
    optimization: {
      minimize: true,
    },
    plugins: [
      new Dotenv(),
      // Minify JS
      new TerserPlugin({
        terserOptions: {
          compress: {
            unused: true,
            dead_code: true,
          },
        },
      }),
      // Minify CSS
      new CssnanoPlugin({
        preset: 'default',
      }),
      // Minify HTML
      new HtmlMinifierPlugin({
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyCSS: true,
        minifyJS: true,
        reduceBooleanAttributes: true,
        useShortDoctype: true,
      }),
    ],
  },
};
