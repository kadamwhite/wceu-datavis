const { resolve } = require('path');
const webpack = require('webpack');
const findCacheDir = require('find-cache-dir');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackFileList = require('webpack-file-list-plugin');

const outputPath = resolve(__dirname, 'dist');

module.exports = {
  devtool: 'source-map',

  context: resolve(__dirname, 'src'),

  entry: {
    'tag_adjacency': './tag-adjacency.jsx',
  },

  output: {
    // the output bundle
    filename: '[name]-[hash].min.js',

    path: outputPath,
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/react-scripts/
              // directory for faster rebuilds. We use findCacheDir() because of:
              // https://github.com/facebookincubator/create-react-app/issues/483
              cacheDirectory: findCacheDir({
                name: 'react-scripts',
              }),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[path][name]--[local]--[hash:base64:5]',
              },
            },
            {
              // See postcss.config.js for further configuration
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'stylus-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        }),
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'url-loader?limit=10000',
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    // Set NODE_ENV to production so that Uglify can strip out dev-only code
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),

    // Extract css into bundle.css
    new ExtractTextPlugin('[name]-[contenthash].css'),

    // Minify with UglifyJS
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false,
      },
    }),

    // Generate a manifest of webpack-authored filenames that the plugin can use
    // to enqueue production-ready bundles
    new WebpackFileList({
      filename: 'webpack-manifest.json',
      path: outputPath,
    }),
  ],

};
