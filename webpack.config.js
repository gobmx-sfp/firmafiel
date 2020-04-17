'use strict';

const path = require('path');

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
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
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
