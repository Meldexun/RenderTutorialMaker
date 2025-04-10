(async function(gl) {
	// create default projection matrix
	this.projection = mat4.perspective(mat4.create(), toRadian(70.0), gl.canvas.width / gl.canvas.height, 0.01, 10000.0);
	// setup camera controls
	this.setupCamera3D([0.0, 0.0, 0.0], 20.0, -30.0, -60.0);

	// create model provider based on "Model" property
	this.modelProvider = createModelProvider(gl, () => properties.get("Model").getValue());

	{
		// initialize object renderer
		const program = await fetchProgram(gl, "/shaders/position_texture_color_normal_light.vsh", "/shaders/position_texture_color_normal_light.fsh");
		const u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
		const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
		const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");

		const u_ViewPosition = gl.getUniformLocation(program, "u_ViewPosition");
		const u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
		const u_AmbientColor = gl.getUniformLocation(program, "u_AmbientColor");
		const u_DiffuseColor = gl.getUniformLocation(program, "u_DiffuseColor");
		const u_SpecularColor = gl.getUniformLocation(program, "u_SpecularColor");
		const u_SpecularShininess = gl.getUniformLocation(program, "u_SpecularShininess");

		const u_LightConstant = gl.getUniformLocation(program, "u_LightConstant");
		const u_LightLinear = gl.getUniformLocation(program, "u_LightLinear");
		const u_LightQuadratic = gl.getUniformLocation(program, "u_LightQuadratic");

		const u_LightDirection = gl.getUniformLocation(program, "u_LightDirection");
		const u_LightCutoffInner = gl.getUniformLocation(program, "u_LightCutoffInner");
		const u_LightCutoffOuter = gl.getUniformLocation(program, "u_LightCutoffOuter");

		this.objectRenderer = {
			program: program,
			u_ProjectionMatrix: u_ProjectionMatrix,
			u_ViewMatrix: u_ViewMatrix,
			u_ModelMatrix: u_ModelMatrix,

			u_ViewPosition: u_ViewPosition,
			u_LightPosition: u_LightPosition,
			u_AmbientColor: u_AmbientColor,
			u_DiffuseColor: u_DiffuseColor,
			u_SpecularColor: u_SpecularColor,
			u_SpecularShininess: u_SpecularShininess,

			u_LightConstant: u_LightConstant,
			u_LightLinear: u_LightLinear,
			u_LightQuadratic: u_LightQuadratic,

			u_LightDirection: u_LightDirection,
			u_LightCutoffInner: u_LightCutoffInner,
			u_LightCutoffOuter: u_LightCutoffOuter
		};
	}

	{
		// initialize light renderer
		const program = await fetchProgram(gl, "/shaders/position_color.vsh", "/shaders/position_color.fsh");
		const u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
		const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
		const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
		const a_Position = gl.getAttribLocation(program, "a_Position");
		const a_Color = gl.getAttribLocation(program, "a_Color");

		this.lightRenderer = {
			program: program,
			u_ProjectionMatrix: u_ProjectionMatrix,
			u_ViewMatrix: u_ViewMatrix,
			u_ModelMatrix: u_ModelMatrix,
			a_Position: a_Position,
			a_Color: a_Color
		};
	}

	// setup default gl state
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);
});
