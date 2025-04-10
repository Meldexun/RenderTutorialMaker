(async function(gl) {
	{
		const program = await fetchProgram(gl, "/shaders/position_texture.vsh", "/shaders/position_texture.fsh");
		const u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
		const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
		const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
		const a_Position = gl.getAttribLocation(program, "a_Position");
		const a_Texture = gl.getAttribLocation(program, "a_Texture");

		const texture = loadTexture(gl, "/textures/flower.jpg");

		const vertexBuffer = gl.createBuffer();

		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array([
			0, 1, 2,
			2, 3, 0
		]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		this.textureRenderer = {
			program: program,
			u_ProjectionMatrix: u_ProjectionMatrix,
			u_ViewMatrix: u_ViewMatrix,
			u_ModelMatrix: u_ModelMatrix,
			a_Position: a_Position,
			a_Texture: a_Texture,
			texture: texture,
			vertexBuffer: vertexBuffer,
			indexBuffer: indexBuffer
		};
	}
});
