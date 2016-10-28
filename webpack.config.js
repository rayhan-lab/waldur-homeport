var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var scssPath = path.resolve(__dirname, './assets/sass');
var extractPlugin = new ExtractTextPlugin('./css/bundle.min.css');

module.exports = {
    options: {
        entry: './app/scripts/index.js',
        output: {
            path: path.resolve(__dirname, './app/static'),
            filename: 'js/bundle.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'ng-annotate!babel',
                    exclude: /node_modules/
                },
                {
                    test: /\.html$/,
                    loader: 'html'
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract('style', 'css!sass?includePaths[]=' + scssPath)
                },
            ]
        },
        plugins: [
            extractPlugin
        ],
    },
    dev: {
        watch: true,
        keepalive: true,
        failOnError: false,
        devtool: 'source-map',
        debug: true,
    },
    prod: {
        plugins: [
            extractPlugin,
            new webpack.optimize.DedupePlugin()
        ]
    }
};