let gl;

main();

async function main() {
	const canvas = document.querySelector("#glcanvas");
	gl = canvas.getContext("webgl2");

	console.log(gl);
	if (gl === null) {
		alert(
			"Unable to initialize WebGL. Your browser or machine may not support it.",
		);
		return;
	}

	await init(gl);

	requestAnimationFrame(loop)
}

let program;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_ModelMatrix;
let vao;

async function init(gl) {
	program = await loadProgram(gl, "test.vsh", "test.fsh");
	u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
	u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
	u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");

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

	vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
	gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindVertexArray(null);
}

var prevTime = 0;

function loop(time) {
	const deltaTime = time - prevTime;
	prevTime = time;

	gl.clearColor(0.1, 0.2, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(program);
	let projection = new DOMMatrix();
	let view = new DOMMatrix();
	let model = new DOMMatrix();
	gl.uniformMatrix4fv(u_ProjectionMatrix, false, projection.toFloat32Array());
	gl.uniformMatrix4fv(u_ViewMatrix, false, view.toFloat32Array());
	gl.uniformMatrix4fv(u_ModelMatrix, false, model.toFloat32Array());

	gl.bindVertexArray(vao);
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_INT, 0);
	gl.bindVertexArray(null);

	gl.useProgram(null);

	requestAnimationFrame(loop)
}
