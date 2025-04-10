(async function(gl) {
	// create default projection matrix
	this.projection = mat4.perspective(mat4.create(), toRadian(70.0), gl.canvas.width / gl.canvas.height, 0.01, 10000.0);
	// setup camera controls
	this.setupCamera3D([0.0, 0.0, 0.0], 20.0, -30.0, -60.0);

	// create model provider based on "Model" property
	this.modelProvider = createModelProvider(gl, () => properties.get("Model").getValue());

	{
		// initialize object renderer
		const program = await fetchProgram(gl, "/shaders/position_texture_color_fog.vsh", "/shaders/position_texture_color_fog.fsh");
		const u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
		const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
		const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");

		const u_FogMode = gl.getUniformLocation(program, "u_FogMode");
		const u_FogStart = gl.getUniformLocation(program, "u_FogStart");
		const u_FogEnd = gl.getUniformLocation(program, "u_FogEnd");
		const u_FogDensity = gl.getUniformLocation(program, "u_FogDensity");
		const u_FogColor = gl.getUniformLocation(program, "u_FogColor");
		const u_FogMatrix = gl.getUniformLocation(program, "u_FogMatrix");

		this.objectRenderer = {
			program: program,
			u_ProjectionMatrix: u_ProjectionMatrix,
			u_ViewMatrix: u_ViewMatrix,
			u_ModelMatrix: u_ModelMatrix,

			u_FogMode: u_FogMode,
			u_FogStart: u_FogStart,
			u_FogEnd: u_FogEnd,
			u_FogDensity: u_FogDensity,
			u_FogColor: u_FogColor,
			u_FogMatrix: u_FogMatrix
		};
	}

	// create frustum renderer
	this.frustumRenderer = await createFrustumRenderer(gl);

	// setup default gl state
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);
});
