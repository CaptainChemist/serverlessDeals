const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
// const PATHS = require('./config/paths.js');

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  externals: [nodeExternals()],
  // resolve: {
  //   extensions: ['.js'],
  //   modules: ['node_modules', PATHS.root]
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: __dirname,
        exclude: /node_modules/
      }
    ]
  }
};
