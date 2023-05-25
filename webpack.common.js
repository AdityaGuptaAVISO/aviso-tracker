const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')

module.exports = {
    entry: {
        popup: path.resolve('src/popup/index.tsx'),
        options: path.resolve('src/options/index.tsx'),
        background: path.resolve('src/background/background.ts'),
        fetchInfoScript: path.resolve('src/contentScript/fetchInfoScript.ts'),
        contentScript: path.resolve('src/contentScript/index.ts'),
        dashboard: path.resolve('src/dashboard/index.tsx'),
        newTab: path.resolve('src/tabs/index.tsx'),
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                test: /\.tsx?$/,
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader', // postcss loader needed for tailwindcss
                        options: {
                            postcssOptions: {
                                ident: 'postcss',
                                plugins: [tailwindcss, autoprefixer],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: ['style-loader','css-loader','sass-loader'],
            },
            {
                type: 'assets/resource',
                test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/,
            },
        ]
    },
    "plugins": [
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve('src/static'),
                    to: path.resolve('dist')
                },
                {
                    from: path.resolve('src/static/AppLogo.png'),
                    to: path.resolve('dist')
                },
                {
                    from: path.resolve('src/static/manifest.json'),
                    to: path.resolve('dist')
                }
            ]
        }),
        ...getHtmlPlugins([
            'popup',
            'options',
            'dashboard',
            'newTab'
        ])
    ],
    resolve: {
        extensions: ['.tsx', '.js', '.ts', 'scss']
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist')
    },
    optimization: {
        splitChunks: {
            chunks(chunk){
                return chunk.name !== 'contentScript';
            }
        }
    }
}

function getHtmlPlugins (chunks) {
    return chunks.map(chunk => new HtmlPlugin({
        title: 'Aviso Tracker',
        filename: `${chunk}.html`,
        chunks: [chunk]
    }))
}