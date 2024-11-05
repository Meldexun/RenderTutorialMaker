main();

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
	const canvas = document.querySelector("#glcanvas");
	const gl = canvas.getContext("webgl2");

	console.log(gl);
	if (gl === null) {
		alert(
			"Unable to initialize WebGL. Your browser or machine may not support it.",
		);
		return;
	}

	await init(gl);

	for (var i = 0; i < 1000; i++) {
		await loop(gl);
	}
}

var program;
var vbo;
var vao;

async function init(gl) {
	gl.clearColor(0.2, 0.3, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	program = await loadProgram(gl, "test.vsh", "test.fsh");

	vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	var data = new Float32Array([
		0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,
		1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
	gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindVertexArray(null);
}

async function loadProgram(gl, vertexShader, fragmentShader) {
	var program = gl.createProgram();
	var vsh = await loadShader(gl, gl.VERTEX_SHADER, vertexShader);
	var fsh = await loadShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

	gl.attachShader(program, vsh);
	gl.attachShader(program, fsh);

	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const info = gl.getProgramInfoLog(program);
		throw `Could not link program (id=${program}). \n\n${info}`;
	}

	gl.deleteShader(vsh);
	gl.deleteShader(fsh);

	return program;
}

async function loadShader(gl, type, source) {
	var shader = gl.createShader(type);
	await fetch(source)
		.then(res => res.text())
		.then(text => gl.shaderSource(shader, text))
		.catch(e => console.log(e));

	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const info = gl.getShaderInfoLog(shader);
		throw `Could not compile shader (id=${shader}). \n\n${info}`;
	}

	return shader;
}

var c = 0.0;
async function loop(gl) {
	gl.clearColor(c / 4000.0, 1.0 - c / 2000.0, 0.75, 1.0);
	c++;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(program);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	gl.bindVertexArray(null);
	gl.useProgram(null);

	await sleep(10);
}
