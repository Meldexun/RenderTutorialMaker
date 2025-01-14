(function(gl, time, properties) {
	gl.clearColor(0.1, 0.2, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST);

	gl.useProgram(this.program);
	gl.uniformMatrix4fv(this.u_ProjectionMatrix, false, properties.get("Projection").toFloat32Array());
	gl.uniformMatrix4fv(this.u_ViewMatrix, false, new DOMMatrix().translate(0.0, 0.0, -4.0).toFloat32Array());
	gl.uniformMatrix4fv(this.u_ModelMatrix, false, new DOMMatrix().rotateAxisAngle(0.0, 1.0, 0.0, time * 0.001 / 3.0 * 360.0).toFloat32Array());

	// TODO render model
	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.model.vertexBuffer);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(1);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.model.textureBuffer);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(2);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.model.normalBuffer);
	gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);

	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.uniform1i(gl.getUniformLocation(this.program, "u_Texture"), 0);

	gl.drawElements(gl.TRIANGLES, this.model.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.useProgram(null);
});
