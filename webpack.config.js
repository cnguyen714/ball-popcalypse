const path = require('path');

module.exports = {
  entry: './javascript/main.js',
  output: {
    filename: './javascript/bundle.js',
    path: path.resolve(__dirname, '')
  }
};