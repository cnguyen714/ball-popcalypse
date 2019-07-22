const path = require('path');

module.exports = {
  entry: './javascript/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, ''),
    publicPath: "/ceaseless-battle/",
  }
};