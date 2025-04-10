(async function(gl) {
	// create default projection matrix
	this.projection = mat4.perspective(mat4.create(), toRadian(70.0), gl.canvas.width / gl.canvas.height, 1.0, 100.0);
	// enable view matrix manipulation with mouse
	this.setupCamera3D([0.0, 0.0, 0.0], 30.0, -35.0, -30.0);

	// create model provider based on "Model" property
	this.modelProvider = createModelProvider(gl, () => properties.get("Model").getValue());

	// setup default gl state
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);
});
