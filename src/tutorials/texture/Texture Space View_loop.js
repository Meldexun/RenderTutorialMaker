(function(gl, time) {
	gl.clearColor(0.1, 0.2, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// render texture
	gl.useProgram(this.textureRenderer.program);
	gl.bindTexture(gl.TEXTURE_2D, this.textureRenderer.texture);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.textureRenderer.vertexBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.textureRenderer.indexBuffer);

	gl.uniformMatrix4fv(this.textureRenderer.u_ProjectionMatrix, false, mat4.create());
	gl.uniformMatrix4fv(this.textureRenderer.u_ViewMatrix, false, mat4.create());
	gl.uniformMatrix4fv(this.textureRenderer.u_ModelMatrix, false, mat4.create());

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[properties.get("TEXTURE_MIN_FILTER").getValue()]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[properties.get("TEXTURE_MAG_FILTER").getValue()]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[properties.get("TEXTURE_WRAP_S").getValue()]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[properties.get("TEXTURE_WRAP_T").getValue()]);

	gl.enableVertexAttribArray(this.textureRenderer.a_Position);
	gl.enableVertexAttribArray(this.textureRenderer.a_Texture);
	gl.vertexAttribPointer(this.textureRenderer.a_Position, 3, gl.FLOAT, false, 20, 0);
	gl.vertexAttribPointer(this.textureRenderer.a_Texture, 2, gl.FLOAT, false, 20, 12);

	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);

	gl.disableVertexAttribArray(this.textureRenderer.a_Position);
	gl.disableVertexAttribArray(this.textureRenderer.a_Texture);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);

	// render coordinates
	gl.useProgram(this.coordinateRenderer.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.coordinateRenderer.vertexBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.coordinateRenderer.indexBuffer);

	gl.uniformMatrix4fv(this.coordinateRenderer.u_ProjectionMatrix, false, mat4.create());
	gl.uniformMatrix4fv(this.coordinateRenderer.u_ViewMatrix, false, mat4.create());
	gl.uniformMatrix4fv(this.coordinateRenderer.u_ModelMatrix, false, mat4.create());

	const t1 = properties.get("Texture Coordinate 1").getValue();
	const t2 = properties.get("Texture Coordinate 2").getValue();
	const t3 = properties.get("Texture Coordinate 3").getValue();
	const t4 = properties.get("Texture Coordinate 4").getValue();
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		t1[0] - 0.5, 0.5 - t1[1], 0.0, 1.0, 0.0, 0.0, 1.0,
		t2[0] - 0.5, 0.5 - t2[1], 0.0, 1.0, 0.0, 0.0, 1.0,
		t3[0] - 0.5, 0.5 - t3[1], 0.0, 1.0, 0.0, 0.0, 1.0,
		t4[0] - 0.5, 0.5 - t4[1], 0.0, 1.0, 0.0, 0.0, 1.0
	]), gl.STREAM_DRAW);

	gl.enableVertexAttribArray(this.coordinateRenderer.a_Position);
	gl.enableVertexAttribArray(this.coordinateRenderer.a_Color);
	gl.vertexAttribPointer(this.coordinateRenderer.a_Position, 3, gl.FLOAT, false, 28, 0);
	gl.vertexAttribPointer(this.coordinateRenderer.a_Color, 4, gl.FLOAT, false, 28, 12);

	gl.drawElements(gl.LINES, 8, gl.UNSIGNED_INT, 0);

	gl.disableVertexAttribArray(this.coordinateRenderer.a_Position);
	gl.disableVertexAttribArray(this.coordinateRenderer.a_Color);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.useProgram(null);
});
