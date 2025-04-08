(function(gl, time) {
	gl.clearColor(0.1, 0.2, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(this.program);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

	gl.uniformMatrix4fv(this.u_ProjectionMatrix, false, mat4.create());
	gl.uniformMatrix4fv(this.u_ViewMatrix, false, mat4.create());
	gl.uniformMatrix4fv(this.u_ModelMatrix, false, mat4.create());

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[properties.get("TEXTURE_MIN_FILTER").getValue()]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[properties.get("TEXTURE_MAG_FILTER").getValue()]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[properties.get("TEXTURE_WRAP_S").getValue()]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[properties.get("TEXTURE_WRAP_T").getValue()]);

	const p1 = properties.get("Position 1").getValue();
	const p2 = properties.get("Position 2").getValue();
	const p3 = properties.get("Position 3").getValue();
	const p4 = properties.get("Position 4").getValue();
	const t1 = properties.get("Texture Coordinate 1").getValue();
	const t2 = properties.get("Texture Coordinate 2").getValue();
	const t3 = properties.get("Texture Coordinate 3").getValue();
	const t4 = properties.get("Texture Coordinate 4").getValue();
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		p1[0], p1[1], 0.0, t1[0], t1[1],
		p2[0], p2[1], 0.0, t2[0], t2[1],
		p3[0], p3[1], 0.0, t3[0], t3[1],
		p4[0], p4[1], 0.0, t4[0], t4[1]
	]), gl.STREAM_DRAW);

	gl.enableVertexAttribArray(this.a_Position);
	gl.enableVertexAttribArray(this.a_Texture);
	gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 20, 0);
	gl.vertexAttribPointer(this.a_Texture, 2, gl.FLOAT, false, 20, 12);

	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);

	gl.disableVertexAttribArray(this.a_Position);
	gl.disableVertexAttribArray(this.a_Texture);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
});
