(function(gl, time) {
	gl.clearColor(0.1, 0.2, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// compile shader based on input
	const vertexShaderSource = `#version 300 es

	precision mediump float;

	uniform mat4 u_ProjectionMatrix;
	uniform mat4 u_ViewMatrix;
	uniform mat4 u_ModelMatrix;

	in vec3 a_Position;
	in vec2 a_Texture;
	in vec4 a_Color;
	in vec3 a_Normal;

	out vec3 v_Position;
	out vec2 v_Texture;
	out vec4 v_Color;
	out vec3 v_Normal;

	void main() {
		vec4 modelPosition = u_ModelMatrix * vec4(a_Position, 1.0);
	    gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelPosition;
	    v_Position = vec3(modelPosition);
	    v_Texture = a_Texture;
	    v_Color = a_Color;
	    v_Normal = mat3(transpose(inverse(u_ModelMatrix))) * a_Normal;
	}`;
	const fragmentShaderSource = `#version 300 es

	precision mediump float;

	uniform mat4 u_ProjectionMatrix;
	uniform mat4 u_ViewMatrix;
	uniform mat4 u_ModelMatrix;

	uniform sampler2D u_Texture;

	in vec3 v_Position;
	in vec2 v_Texture;
	in vec4 v_Color;
	in vec3 v_Normal;

	out vec4 f_Color;

	void main() {
	    ${properties.get("Fragment Shader").getValue()}
	}`;
	if (vertexShaderSource !== this.vertexShaderSource || fragmentShaderSource !== this.fragmentShaderSource) {
		this.vertexShaderSource = vertexShaderSource;
		this.fragmentShaderSource = fragmentShaderSource;

		try {
			const program = loadProgram(gl, this.vertexShaderSource, this.fragmentShaderSource);
			if (this.program != undefined && this.program != null) {
				gl.deleteProgram(this.program);
			}
			this.program = program;
		} catch (err) {
			// handled in screen space view
		}
	}

	// setup projection matrix and view matrix
	const projection = this.projection;
	const view = this.getCamera3D();

	// render object
	if (this.program != undefined && this.program != null) {
		gl.useProgram(this.program);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_ProjectionMatrix"), false, projection);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_ViewMatrix"), false, view);
		const model = this.modelProvider.getModel();
		if (model != null) {
			renderGLTF(gl, model);
		}
		gl.useProgram(null);
	}

	// render frustum
	this.frustumRenderer.render(gl, projection, view, views.get("Screen Space View").projection, views.get("Screen Space View").getCamera3D());
});
