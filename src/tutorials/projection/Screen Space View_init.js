(async function(gl) {
	// enable view matrix manipulation with mouse
	this.setupCamera3D([0.0, -10.0, 0.0], 0.0, 0.0, -40.0, () => properties.get("View Matrix").setValue(this.getCamera3D()));

	// create model provider based on "Model" property
	this.modelProvider = createModelProvider(gl, () => properties.get("Model").getValue());

	// create object renderer
	{
		const program = await fetchProgram(gl, "position_texture_color.vsh", "position_texture_color.fsh");
		const u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
		const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
		const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
		const a_Position = gl.getAttribLocation(program, "a_Position");
		const a_Texture = gl.getAttribLocation(program, "a_Texture");
		const a_Color = gl.getAttribLocation(program, "a_Color");

		this.objectRenderer = {
			program: program,
			u_ProjectionMatrix: u_ProjectionMatrix,
			u_ViewMatrix: u_ViewMatrix,
			u_ModelMatrix: u_ModelMatrix,
			a_Position: a_Position,
			a_Texture: a_Texture,
			a_Color: a_Color
		};
	}

	// setup default gl state
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);
});
