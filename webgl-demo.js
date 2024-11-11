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
let vao;

async function init(gl) {
	program = await loadProgram(gl, "test.vsh", "test.fsh");

	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	const data = new Float32Array([
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
	const program = gl.createProgram();
	const vsh = await loadShader(gl, gl.VERTEX_SHADER, vertexShader);
	const fsh = await loadShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

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
	const shader = gl.createShader(type);
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

var prevTime = 0;

function loop(time) {
	const deltaTime = time - prevTime;
	prevTime = time;

	gl.clearColor(0.2, 0.2 + (0.8 - 0.2) * (Math.sin(time * 0.001 / 4 * 2.0 * Math.PI) * 0.5 + 0.5), 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(program);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	gl.bindVertexArray(null);
	gl.useProgram(null);

	requestAnimationFrame(loop)
}
