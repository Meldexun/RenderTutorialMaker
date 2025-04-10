(function(gl, time) {
	gl.clearColor(0.1, 0.2, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// setup projection matrix and view matrix
	const projectionMatrix = this.projection;
	const viewMatrix = this.getCamera3D();
	const modelMatrix = mat4.create();

	// render object
	gl.useProgram(this.objectRenderer.program);
	gl.uniformMatrix4fv(this.objectRenderer.u_ProjectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(this.objectRenderer.u_ViewMatrix, false, viewMatrix);

	gl.uniform1i(this.objectRenderer.u_FogMode, properties.get("Fog Mode").getValue());
	gl.uniform1f(this.objectRenderer.u_FogStart, properties.get("Fog Start").getValue());
	gl.uniform1f(this.objectRenderer.u_FogEnd, properties.get("Fog End").getValue());
	gl.uniform1f(this.objectRenderer.u_FogDensity, properties.get("Fog Density").getValue());
	gl.uniform4fv(this.objectRenderer.u_FogColor, properties.get("Fog Color").getValue());
	gl.uniformMatrix4fv(this.objectRenderer.u_FogMatrix, false, this.getCamera3D());

	const model = this.modelProvider.getModel();
	if (model != null) {
		renderGLTF(gl, model, modelMatrix);
	}
	gl.useProgram(null);
});
