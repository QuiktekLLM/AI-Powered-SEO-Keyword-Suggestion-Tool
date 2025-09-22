const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: './',
  },
  devtool: isProduction ? 'source-map' : 'inline-source-map',
  devServer: {
    static: './dist',
    open: true,
    port: 8080,
    hot: true,
  },
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: isProduction,
            drop_debugger: isProduction,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
        },
        utils: {
          test: /keyword-utils\.js/,
          name: 'keyword-utils',
          chunks: 'all',
          priority: 8,
        },
      },
    },
    usedExports: true, // Enable tree shaking
    sideEffects: false, // Mark all modules as side-effect free for better tree shaking
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
                  },
                  modules: false, // Keep ES6 modules for better tree shaking
                  useBuiltIns: 'usage',
                  corejs: 3,
                },
              ],
            ],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: !isProduction,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: !isProduction,
              postcssOptions: {
                plugins: [
                  ['autoprefixer'],
                  ...(isProduction ? [['cssnano', { preset: 'default' }]] : []),
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true,
      } : false,
    }),
    ...(isProduction ? [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
      }),
    ] : []),
  ],
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  stats: {
    assets: true,
    chunks: true,
    modules: false,
    children: false,
  },
};