(async function(gl) {
	this.program = await loadProgram(gl, "../shaders/position_texture_normal.vsh", "../shaders/position_texture_normal.fsh");
	this.u_ProjectionMatrix = gl.getUniformLocation(this.program, "u_ProjectionMatrix");
	this.u_ViewMatrix = gl.getUniformLocation(this.program, "u_ViewMatrix");
	this.u_ModelMatrix = gl.getUniformLocation(this.program, "u_ModelMatrix");

	// TODO load model
	this.model = await loadModel(gl, "../models/indoor plant_02.obj");

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
	const image = new Image();
	image.src = "../models/indoor plant_2_COL.jpg";
	image.onload = () => {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	};
	this.texture = texture;
});
