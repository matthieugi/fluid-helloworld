/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require('path');

module.exports = env => {
    const htmlTemplate = "./src/index.html";
    const plugins = env && env.clean
        ? [new CleanWebpackPlugin(), new HtmlWebpackPlugin({ template: htmlTemplate }), new webpack.EnvironmentPlugin(['FLUIDRELAY_ACCESSKEY'])]
        : [new HtmlWebpackPlugin({ template: htmlTemplate }), new webpack.EnvironmentPlugin(['FLUIDRELAY_ACCESSKEY'])];

    const mode = env && env.prod
        ? "production"
        : "development";

    return {
        devtool: "inline-source-map",
        entry: {
            app: "./src/app.js",
        },
        mode,
        output: {
            filename: "[name].[contenthash].js",
            path: path.resolve(__dirname, 'dist'),
        },
        plugins,
        devServer: {
            open: true
        }
    };
};
