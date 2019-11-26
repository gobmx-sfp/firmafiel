const path = require('path');
module.exports = {
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    },
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'firmafiel.js',
      library: '@gobmx-sfp/firmafiel',
      libraryTarget: 'umd',
      globalObject: 'this'
    }
};