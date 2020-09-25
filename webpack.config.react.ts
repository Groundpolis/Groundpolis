import * as fs from 'fs';
import * as webpack from 'webpack';

const locales = require('./locales');
const meta = require('./package.json');

class WebpackOnBuildPlugin {
	constructor(readonly callback: (stats: any) => void) {
	}

	public apply(compiler: any) {
		compiler.hooks.done.tap('WebpackOnBuildPlugin', this.callback);
	}
}

module.exports = {
	mode: 'development',
	entry: './src/client-react/app.tsx',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [{
					loader: 'ts-loader',
					options: {
						happyPackMode: true,
						transpileOnly: true,
						configFile: __dirname + '/src/client-react/tsconfig.json',
					}
				}]
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		path: __dirname + '/built/client/assets',
		filename: `react.${meta.version}.js`,
		publicPath: `/assets/`
	},
	plugins: [
		new webpack.ProgressPlugin({}),
		new webpack.DefinePlugin({
			_VERSION_: JSON.stringify(meta.version),
			_LANGS_: JSON.stringify(Object.entries(locales).map(([k, v]: [string, any]) => [k, v._lang_])),
			_ENV_: JSON.stringify(process.env.NODE_ENV)
		}),
		new WebpackOnBuildPlugin((stats: any) => {
			fs.writeFileSync('./built/meta.json', JSON.stringify({ version: meta.version }), 'utf-8');
		}),
	]
};
