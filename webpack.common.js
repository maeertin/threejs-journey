const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

const packagePath = process.cwd()

module.exports = {
  entry: path.resolve(packagePath, './src/script.js'),
  output: {
    hashFunction: 'xxhash64',
    filename: 'bundle.[contenthash].js',
    path: path.resolve(packagePath, './dist'),
  },
  devtool: 'source-map',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(packagePath, './static') }],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(packagePath, './src/index.html'),
      minify: true,
    }),
    new MiniCSSExtractPlugin(),
  ],
  module: {
    rules: [
      // HTML
      {
        test: /\.(html)$/,
        use: ['html-loader'],
      },

      // JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },

      // CSS
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, 'css-loader'],
      },

      // Images
      {
        test: /\.(jpg|png|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[hash][ext]',
        },
      },

      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[hash][ext]',
        },
      },
    ],
  },
}
