'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const externals = Object.keys(
  require(path.resolve('./package.json')).dependencies || {}
);

const baseConfig = {
  mode: 'production',

  entry: {
    main: path.resolve('./src/main.js'),
  },

  module: {
    rules: [
      {
        enforce: 'post',
        test: /fontkit[/\\]index.js$/,
        loader: 'transform-loader?brfs',
      },
      {
        enforce: 'post',
        test: /unicode-properties[/\\]index.js$/,
        loader: 'transform-loader?brfs',
      },
      {
        enforce: 'post',
        test: /linebreak[/\\]src[/\\]linebreaker.js/,
        loader: 'transform-loader?brfs',
      },
      { test: /src[/\\]assets/, loader: 'arraybuffer-loader' },
      { test: /\.afm$/, loader: 'raw-loader' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],

  resolve: {
    alias: {
      fs: 'pdfkit/js/virtual-fs.js',
    },
  },

  externals,
};

module.exports = [
  Object.assign({}, baseConfig, {
    target: 'web',

    output: {
      path: path.resolve('./lib'),
      filename: 'firmafiel.web.js',
      library: '@gobmx-sfp/firmafiel',
      libraryTarget: 'umd',
    },
  }),

  Object.assign({}, baseConfig, {
    target: 'node',

    output: {
      path: path.resolve('./lib'),
      filename: 'firmafiel.js',
      library: '@gobmx-sfp/firmafiel',
      libraryTarget: 'umd',
    },
  }),
];
