'use strict';

const path = require('path');

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

  externals: ['axios', 'crypto', 'node-forge', 'object-hash'],

  devtool: 'source-map',
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
