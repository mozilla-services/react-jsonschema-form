var path = require("path");
var webpack = require("webpack");

module.exports = {
  cache: true,
  context: __dirname + "/src",
  entry: "./index.js",
  output: {
    path: "./dist",
    publicPath: "/dist/",
    filename: "react-jsonschema-form.js",
    library: "JSONSchemaForm",
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    })
  ],
  devtool: "source-map",
  externals: {
    react: {
      root: "React",
      commonjs: "react",
      commonjs2: "react",
      amd: "react"
    },
    'react-dom': {
      root: "ReactDOM",
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
      umd: 'react-dom',
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ["babel"],
        exclude: [
          path.join(__dirname, "node_modules", "core-js"),
          path.join(__dirname, "node_modules", "babel-runtime"),
        ],
      },
      {
        test: /\.json$/,
        loader:"json-loader",
        include: [
          path.join(__dirname, "css"),
          path.join(__dirname, "playground"),
          path.join(__dirname, "node_modules"),
        ],
      }
    ]
  }
};
