const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	context: path.resolve(__dirname, 'src'),
	entry: {
		tutorial_viewer: {
			import: './tutorials/tutorial.js',
			filename: 'tutorials/tutorial.js'
		},
		tutorial_editor: {
			import: './create_tutorial.js',
			filename: 'create_tutorial.js'
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
				{
					from: 'tutorials/tutorial.html',
					to: 'tutorials/tutorial.html'
				},
				'create_tutorial.html',
				'index.html'
			]
		})
	],
	output: {
		clean: true
	}
};
