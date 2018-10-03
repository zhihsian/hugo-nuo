const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// ENV constant
const ENV = { mode: process.env.NODE_ENV };
ENV.isDev = process.env.NODE_ENV === 'development';
ENV.isProd = process.env.NODE_ENV === 'production';
ENV.devtool = ENV.isProd ? 'source-map' : 'cheap-module-eval-source-map';
console.log(`Running webpack in the ${process.env.NODE_ENV} mode`);

// PATH constant
const PATH = { base: __dirname };
PATH.src = path.resolve(PATH.base, 'src');
PATH.styles = path.resolve(PATH.src, 'styles');
PATH.scripts = path.resolve(PATH.src, 'scripts');
PATH.images = path.resolve(PATH.src, 'images');
PATH.fonts = path.resolve(PATH.src, 'fonts');
PATH.exclude = /(node_modules|bower_components)/;
PATH.entry = { bundle: ['./src/styles/main.css', './src/scripts/main.js'] };
PATH.dist = path.resolve(PATH.base, 'static/static');
PATH.manifest = path.resolve(PATH.base, 'data', 'manifest.json');
PATH.publicPath = '/static/';
PATH.filename = {
  scripts: 'scripts/[name].js?v=[chunkhash:10]',
  styles: 'styles/[name].css?v=[chunkhash:10]',
  images: 'images/[name].[ext]?v=[hash:10]',
  fonts: 'fonts/[name].[ext]?v=[hash:10]',
};

const loaders = env => [
  {
    test: /\.css$/,
    exclude: PATH.exclude,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: true,
          sourceMap: true,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          plugins: [
            require('stylelint')({
              config: {
                "extends": "stylelint-config-standard",
              },
            }),
            require('postcss-import')(),
            require('postcss-preset-env')({
              stage: 2,
              features: {
                'nesting-rules': true
              }
            }),
            require('postcss-reporter')({
              clearReportedMessages: true,
            }),
            require('autoprefixer')(),
            require('cssnano')(),
          ],
        },
      },
    ],
  },
  {
    test: /\.js$/,
    exclude: PATH.exclude,
    use: [
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: env.isProd ? false : true,
          presets: ['@babel/preset-env'],
        },
      },
      {
        loader: 'eslint-loader',
        options: {
          useEslintrc: false,
          envs: [ "browser", "es6" ],
          extends: "eslint:recommended",
        },
      },
    ],
  },
  {
    test: /\.(png|svg|webp|jpe?g|gif)$/,
    include: PATH.images,
    exclude: PATH.exclude,
    loader: 'file-loader',
    options: {
      name: PATH.filename.images,
    },
  },
  {
    test: /\.(eot|ttf|otf|woff2?|svg)$/,
    include: PATH.fonts,
    exclude: PATH.exclude,
    loader: 'file-loader',
    options: {
      name: PATH.filename.fonts,
    },
  },
]

const plugins = env => [
  new MiniCssExtractPlugin({
    filename: PATH.filename.styles,
  }),
  new ManifestPlugin({
    fileName: PATH.manifest,
    filter: chunk => chunk.name && /\S*.(js|css)$/.test(chunk.name),
  }),
]

module.exports = {
  mode: ENV.mode,
  context: PATH.base,
  entry: PATH.entry,
  output: {
    path: PATH.dist,
    publicPath: PATH.publicPath,
    filename: PATH.filename.scripts,
  },
  devtool: ENV.devtool,
  module: {
    rules: loaders(ENV),
  },
  plugins: plugins(ENV),
};
