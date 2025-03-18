const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	context: path.resolve(__dirname, 'src'),
	entry: {
		edit: {
			import: './edit.js',
			filename: 'edit.js'
		},
		view: {
			import: './view.js',
			filename: 'view.js'
		}
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				'models/**/*',
				'shaders/**/*',
				{
					from: 'tutorials/projection/**/*',
					info: { minimized: true }
				},
				'edit.css',
				'edit.html',
				'index.css',
				'index.html',
				'view.css',
				'view.html'
			]
		})
	],
	output: {
		clean: true
	}
};
