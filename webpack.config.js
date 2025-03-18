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
		tutorial: {
			import: './tutorial.js',
			filename: 'tutorial.js'
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
				'tutorial.css',
				'tutorial.html'
			]
		})
	],
	output: {
		clean: true
	}
};
