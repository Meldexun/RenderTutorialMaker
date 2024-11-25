let programTP;
let u_ProjectionMatrixTP;
let u_ViewMatrixTP;
let u_ModelMatrixTP;
let vaoTP;
let vao1TP;

window.initTP = async function initTP(gl) {
	programTP = await loadProgram(gl, "../shaders/test.vsh", "../shaders/test.fsh");
	u_ProjectionMatrixTP = gl.getUniformLocation(programTP, "u_ProjectionMatrix");
	u_ViewMatrixTP = gl.getUniformLocation(programTP, "u_ViewMatrix");
	u_ModelMatrixTP = gl.getUniformLocation(programTP, "u_ModelMatrix");

	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,

		0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0,
		1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0,

		0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0,

		1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0,
		1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0,

		0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
		1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
		1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,

		0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
		1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0
	]), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const ebo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array([
		 0,  1,  2,  2,  3,  0,
		 4,  5,  6,  6,  7,  4,
		 8,  9, 10, 10, 11,  8,
		12, 13, 14, 14, 15, 12,
		16, 17, 18, 18, 19, 16,
		20, 21, 22, 22, 23, 20
	]), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	vaoTP = gl.createVertexArray();
	gl.bindVertexArray(vaoTP);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
	gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindVertexArray(null);

	const vbo1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		-1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0,  1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0,  1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0,  1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0,  1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
	
		-1.0, -1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0, -1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0, -1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0,  1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0,  1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0,  1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0,  1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0, -1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
	
		-1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0, -1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0, -1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0,  1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		 1.0,  1.0,  1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0,  1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0,  1.0,  1.0, 1.0, 1.0, 1.0, 1.0
	]), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const ebo1 = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo1);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array([
		 0,  1,  2,  3,  4,  5,  6,  7,
		 8,  9, 10, 11, 12, 13, 14, 15,
		16, 17, 18, 19, 20, 21, 22, 23
	]), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	vao1TP = gl.createVertexArray();
	gl.bindVertexArray(vao1TP);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo1);
	gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
	gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo1);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindVertexArray(null);
}

window.renderTP = function renderTP(gl, time) {
	gl.clearColor(0.1, 0.2, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST);

	gl.useProgram(programTP);

	let projection = new DOMMatrix();
	let view = new DOMMatrix();
	let model = new DOMMatrix();
	projection = perspectiveTP(70.0, 16.0 / 9.0, 0.01, 100.0);
	view = view.translateSelf(0.0, 0.0, -6.0);
	view = view.rotateAxisAngleSelf(0.0, 1.0, 0.0, -60.0);
	model = model.rotateAxisAngleSelf(0.0, 1.0, 0.0, time * 0.001 / 3.0 * 360.0);
	model = model.translateSelf(-0.5, -0.5, -0.5);
	gl.uniformMatrix4fv(u_ProjectionMatrixTP, false, projection.toFloat32Array());
	gl.uniformMatrix4fv(u_ViewMatrixTP, false, view.toFloat32Array());
	gl.uniformMatrix4fv(u_ModelMatrixTP, false, model.toFloat32Array());

	gl.bindVertexArray(vaoTP);
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_INT, 0);
	gl.bindVertexArray(null);

	model = perspectiveTP(60.0, 16.0 / 9.0, 0.5, 3.0);
	model = model.translateSelf(0.0, 0.0, -2.0);
	model = model.inverse();
	gl.uniformMatrix4fv(u_ModelMatrixTP, false, model.toFloat32Array());

	gl.bindVertexArray(vao1TP);
	gl.drawElements(gl.LINES, 24, gl.UNSIGNED_INT, 0);
	gl.bindVertexArray(null);

	gl.useProgram(null);
}

function perspectiveTP(fov, aspectRatio, nearPlane, farPlane) {
	const f = 1.0 / Math.tan((fov / 180.0 * Math.PI) * 0.5);
	const matrix = new DOMMatrix();
	matrix.m11 = f / aspectRatio;
	matrix.m22 = f;
	matrix.m33 = (farPlane + nearPlane) / (nearPlane - farPlane);
	matrix.m34 = -1.0;
	matrix.m43 = 2.0 * farPlane * nearPlane / (nearPlane - farPlane);
	matrix.m44 = 0.0;
	return matrix;
}
