(function(gl, time) {
	gl.clearColor(0.1, 0.2, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// setup projection matrix and view matrix
	const projectionMatrix = properties.get("Projection Matrix").getValue();
	const viewMatrix = properties.get("View Matrix").getValue();
	const modelMatrix = properties.get("Model Matrix").getValue();

	// render object
	gl.useProgram(this.objectRenderer.program);
	gl.uniformMatrix4fv(this.objectRenderer.u_ProjectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(this.objectRenderer.u_ViewMatrix, false, viewMatrix);
	const model = this.modelProvider.getModel();
	if (model != null) {
		renderGLTF(gl, model, modelMatrix);
	}
	gl.useProgram(null);
});
