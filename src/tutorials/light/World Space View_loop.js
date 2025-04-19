(function(gl, time) {
	gl.clearColor(0.1, 0.2, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// setup projection matrix and view matrix
	const projectionMatrix = this.projection;
	const viewMatrix = this.getCamera3D();
	const modelMatrix = mat4.create();
	const frustumProjectionMatrix = views.get("Screen Space View").projection;
	const frustumViewMatrix = views.get("Screen Space View").getCamera3D();

	// render object
	gl.useProgram(this.objectRenderer.program);
	gl.uniformMatrix4fv(this.objectRenderer.u_ProjectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(this.objectRenderer.u_ViewMatrix, false, viewMatrix);

	// light properties
	const invertedView = mat4.invert(mat4.create(), frustumViewMatrix);
	gl.uniform3f(this.objectRenderer.u_ViewPosition, invertedView[12], invertedView[13], invertedView[14]);
	gl.uniform3fv(this.objectRenderer.u_LightPosition, properties.get("Light Position").getValue());
	gl.uniform4fv(this.objectRenderer.u_AmbientColor, properties.get("Ambient Color").getValue());
	gl.uniform4fv(this.objectRenderer.u_DiffuseColor, properties.get("Diffuse Color").getValue());
	gl.uniform4fv(this.objectRenderer.u_SpecularColor, properties.get("Specular Color").getValue());
	gl.uniform1f(this.objectRenderer.u_SpecularShininess, properties.get("Specular Shininess").getValue());

	gl.uniform1f(this.objectRenderer.u_LightConstant, properties.get("Constant Attenuation").getValue());
	gl.uniform1f(this.objectRenderer.u_LightLinear, properties.get("Linear Attenuation").getValue());
	gl.uniform1f(this.objectRenderer.u_LightQuadratic, properties.get("Quadratic Attenuation").getValue());

	gl.uniform3fv(this.objectRenderer.u_LightDirection, properties.get("Light Direction").getValue());
	gl.uniform1f(this.objectRenderer.u_LightCutoffInner, Math.cos(toRadian(properties.get("Inner Cutoff").getValue())));
	gl.uniform1f(this.objectRenderer.u_LightCutoffOuter, Math.cos(toRadian(properties.get("Outer Cutoff").getValue())));

	const model = this.modelProvider.getModel();
	if (model != null) {
		renderGLTF(gl, model, modelMatrix);
	}
	gl.useProgram(null);

	// render frustum
	this.frustumRenderer.render(gl, projectionMatrix, viewMatrix, frustumProjectionMatrix, frustumViewMatrix);

	// render light
	gl.useProgram(this.lightRenderer.program);
	gl.uniformMatrix4fv(this.lightRenderer.u_ProjectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(this.lightRenderer.u_ViewMatrix, false, viewMatrix);
	gl.uniformMatrix4fv(this.lightRenderer.u_ModelMatrix, false, modelMatrix);

	gl.vertexAttrib3fv(this.lightRenderer.a_Position, properties.get("Light Position").getValue());
	gl.vertexAttrib4f(this.lightRenderer.a_Color, 1.0, 1.0, 1.0, 1.0);
	gl.drawArrays(gl.POINTS, 0, 1);

	gl.useProgram(null);
});
