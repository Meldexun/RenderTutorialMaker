(async function(gl) {
	{
		const program = await fetchProgram(gl, "position_texture.vsh", "position_texture.fsh");
		const u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
		const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
		const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
		const a_Position = gl.getAttribLocation(program, "a_Position");
		const a_Texture = gl.getAttribLocation(program, "a_Texture");

		const texture = gl.createTexture();
		const image = new Image();
		image.src = "/textures/flower.jpg";
		image.onload = _ => {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		};

		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1.0, -1.0, 0.0, -0.5, 1.5,
			1.0, -1.0, 0.0, 1.5, 1.5,
			1.0, 1.0, 0.0, 1.5, -0.5,
			-1.0, 1.0, 0.0, -0.5, -0.5
		]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

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

	{
		const program = await fetchProgram(gl, "position_color.vsh", "position_color.fsh");
		const u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
		const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
		const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
		const a_Position = gl.getAttribLocation(program, "a_Position");
		const a_Color = gl.getAttribLocation(program, "a_Color");

		const vertexBuffer = gl.createBuffer();

		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array([
			0, 1,
			1, 2,
			2, 3,
			3, 0
		]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		this.coordinateRenderer = {
			program: program,
			u_ProjectionMatrix: u_ProjectionMatrix,
			u_ViewMatrix: u_ViewMatrix,
			u_ModelMatrix: u_ModelMatrix,
			a_Position: a_Position,
			a_Color: a_Color,
			vertexBuffer: vertexBuffer,
			indexBuffer: indexBuffer
		};
	}
});
