(async function(gl) {
	this.program = await loadProgram(gl, "../shaders/position_texture_normal.vsh", "../shaders/position_texture_normal.fsh");
	this.u_ProjectionMatrix = gl.getUniformLocation(this.program, "u_ProjectionMatrix");
	this.u_ViewMatrix = gl.getUniformLocation(this.program, "u_ViewMatrix");
	this.u_ModelMatrix = gl.getUniformLocation(this.program, "u_ModelMatrix");

	// TODO load model
	this.model = await loadModel(gl, "../models/indoor plant_02.obj");
	this.texture = await loadTexture(gl, "../models/indoor plant_2_COL.jpg");
});
