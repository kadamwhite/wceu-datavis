const { resolve } = require('path');
const webpack = require('webpack');
const findCacheDir = require('find-cache-dir');
const objectHash = require('node-object-hash');

const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WebpackFileList = require('webpack-file-list-plugin');

const hardSourceCacheDir = findCacheDir({
  // Render into node_modules/.cache/hard-source/[confighash]/...
  name: 'hard-source/[confighash]',
});

const outputPath = resolve(__dirname, 'dist');

const hotReloadingDeps = [
  // Allow WP to control the publicPath
  './dev-path-transformation',

  // activate HMR for React
  'react-hot-loader/patch',

  // bundle the client for hot reloading
  // only- means to only hot reload for successful updates
  'webpack/hot/only-dev-server',
];

module.exports = {
  devtool: 'cheap-module-source-map',

  context: resolve(__dirname, 'src'),

  entry: {
    tag_adjacency: hotReloadingDeps.concat('./tag-adjacency.jsx'),
  },

  output: {
    // the output bundles
    filename: '[name].js',

    path: resolve(__dirname, 'dist'),

    // necessary for HMR to know to load the hot updates from the dev server:
    // in the WP-served dev bundle, WordPress will re-write this value to match
    // the local plugin URI (see PHP entrypoint & src/dev-path-transformation)
    publicPath: '//localhost:8080/',
  },

  devServer: {
    // enable HMR on the server
    hot: true,

    // inject the 'webpack-dev-server/client' script into the bundle: we only
    // need this when running from the dev server, so we omit it from our main
    // entry files array above
    inline: true,

    // match the output path
    contentBase: resolve(__dirname, 'dist'),

    // Permit hot-reloading from the external WordPress server
    headers: {
      'Access-Control-Allow-Origin': '*',
    },

    // when running from the dev server, all files are served from server root
    publicPath: '/',
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
          // Before running code through babel, check it for lint errors
          {
            loader: 'eslint-loader',
            options: {
              // emit all errors as warnings: this lets us see all issues in the
              // dev console, but the presence of errors will not block rebuilds
              emitWarning: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[path][name]--[hash:base64:5]',
              sourceMap: true,
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
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ],
  },

  externals: {
    // Whitelist the global values that WordPress will inject via wp_localize_script
    WCEU_DATAVIS_PLUGIN_PATH: true,
    WPAPI_SETTINGS: true,
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    // enable HMR globally
    new webpack.HotModuleReplacementPlugin(),

    // prints more readable module names in the browser console on HMR updates
    new webpack.NamedModulesPlugin(),

    // Use hard source caching for faster rebuilds
    new HardSourceWebpackPlugin({
      cacheDirectory: hardSourceCacheDir,
      recordsPath: resolve(hardSourceCacheDir, 'records.json'),

      // Build a string value used by HardSource to determine which cache to
      // use if [confighash] is in cacheDirectory, or if the cache should be
      // replaced if [confighash] does not appear in cacheDirectory.
      configHash: webpackConfig => objectHash().hash(webpackConfig),
    }),

    // Generate a manifest of webpack-authored filenames that the plugin can use
    // to enqueue dev bundles
    new WebpackFileList({
      filename: 'webpack-manifest.json',
      path: outputPath,
    }),
  ],

};
