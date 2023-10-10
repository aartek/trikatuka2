const path = require('path');

module.exports = {
    entry: './sdk/src/index.ts',
    devtool: "source-map",
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(ts)x?$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    target: "web",
    output: {
        filename: 'sdk.js',
        path: path.resolve(__dirname, 'webapp', 'dist'),
        library: 'sdk',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },

};
