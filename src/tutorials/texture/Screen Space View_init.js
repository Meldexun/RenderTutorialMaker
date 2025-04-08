(async function(gl) {
	this.program = await fetchProgram(gl, "position_texture.vsh", "position_texture.fsh");
	this.u_ProjectionMatrix = gl.getUniformLocation(this.program, "u_ProjectionMatrix");
	this.u_ViewMatrix = gl.getUniformLocation(this.program, "u_ViewMatrix");
	this.u_ModelMatrix = gl.getUniformLocation(this.program, "u_ModelMatrix");
	this.a_Position = gl.getAttribLocation(this.program, "a_Position");
	this.a_Texture = gl.getAttribLocation(this.program, "a_Texture");

	this.texture = gl.createTexture();
	this.image = new Image();
	this.image.src = "/textures/flower.jpg";
	this.image.onload = _ => {
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};

	this.vertexBuffer = gl.createBuffer();

	this.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array([
		0, 1, 2,
		2, 3, 0
	]), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
});
