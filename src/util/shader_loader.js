
window.loadProgram = async function loadProgram(gl, vertexShader, fragmentShader) {
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
