const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	context: path.resolve(__dirname, 'src'),
	entry: {
		edit: {
			import: './js/edit.js',
			filename: 'js/edit.js'
		},
		view: {
			import: './js/view.js',
			filename: 'js/view.js'
		}
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				'models/**/*',
				'textures/**/*',
				'shaders/**/*',
				{
					from: 'tutorials/**/*',
					info: { minimized: true }
				},
				'**/*.css',
				'**/*.ejs'
			]
		})
	],
	output: {
		clean: true
	}
};
