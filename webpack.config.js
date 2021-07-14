const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const dotenv = require("dotenv").config();

module.exports = (env, argv) => {
  return {
    // Define the entry points of our application (can be multiple for different sections of a website)
    entry: {
      frontend: "./assets/scripts/frontend.js",
      backend: "./assets/scripts/backend.js",
    },

    // Define the destination directory and filenames of compiled resources
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "public"),
      publicPath: 'assets/'
    },

    // Define development options
    devtool: "source-map",

    // Define loaders
    module: {
      rules: [
        // Compile and extract SCSS files
        {
          test: /\.scss$/,
          exclude: /(node_modules)/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                sourceMap: true
              }
            },
            {
              loader: "postcss-loader",
              options: {
                ident: "postcss",
                plugins: [
                  require("autoprefixer")({browsers: "last 3 versions"})
                ]
              }
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true,
                outputStyle:
                  argv.mode === "production" ? "compressed" : "expanded"
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.svg$/,
          loader: 'svg-inline-loader'
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: "[name].[ext]",
                esModule: false
              }
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"]
            }
          }
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: "babel-loader"
        }, {
          test: /\.svg$/,
          use: ['svg-loader']
        },
      ],
    },

    // Define used plugins
    plugins: [
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(true),
        VERSION: JSON.stringify('5fa3b9'),
        BROWSER_SUPPORTS_HTML5: true,
        TWO: '1+1',
        'typeof window': JSON.stringify('object'),
        'process.env': JSON.stringify(process.env)
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      }),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      }),

    ]
  };
};
