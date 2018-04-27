var webpack = require("webpack");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var WebpackMd5Hash = require("webpack-md5-hash");
var Visualizer = require("webpack-visualizer-plugin");

const GLOBALS = {
  "process.env.NODE_ENV": JSON.stringify("production"),
  __DEV__: false
};

module.exports = {
  devtool: "cheap-module-source-map", //source-map
  entry: ["babel-polyfill", "./src/index.js"],
  target: "web",
  output: {
    path: __dirname + "/docs", // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: "/",
    filename: "assets/js/bundle.js"
  },
  plugins: [
    new WebpackMd5Hash(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new ExtractTextPlugin("assets/css/main.css"),
    new Visualizer(),
    new webpack.ContextReplacementPlugin(
      /highlight\.js\/lib\/languages$/,
      new RegExp(`^./(${["javascript", "css", "bash"].join("|")})$`)
    ),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false
      }
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"]
          }
        }
      },
      {
        test: /(\.css|\.scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"]
        })
      },
      {
        test: /\.ico$/,
        loader: "file?name=[name].[ext]"
      },
      {
        test: /manifest.json$/,
        loader: "file-loader?name=manifest.json!web-app-manifest-loader"
      }
    ]
  }
};
