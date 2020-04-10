'use strict';

const path = require('path');

module.exports = {
  mode: 'production',

  entry: {
    main: path.resolve('./src/main.js'),
  },

  output: {
    path: path.resolve('./lib'),
    filename: 'firmafiel.js',
    library: '@gobmx-sfp/firmafiel',
    libraryTarget: 'umd',
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
