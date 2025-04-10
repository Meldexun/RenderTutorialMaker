(async function(gl) {
	// create default projection matrix
	this.projection = mat4.perspective(mat4.create(), toRadian(70.0), gl.canvas.width / gl.canvas.height, 0.01, 10000.0);
	// setup camera controls
	this.setupCamera3D([0.0, 0.0, 0.0], 20.0, -30.0, -60.0);

	// create model provider based on "Model" property
	this.modelProvider = createModelProvider(gl, () => properties.get("Model").getValue());

	// create object renderer
	{
		const program = await fetchProgram(gl, "/shaders/position_texture_color.vsh", "/shaders/position_texture_color.fsh");
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

	// create frustum renderer
	this.frustumRenderer = await createFrustumRenderer(gl);

	// setup default gl state
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);
});
