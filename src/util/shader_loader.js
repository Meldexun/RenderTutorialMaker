
export function loadProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	const vsh = loadShader(gl, gl.VERTEX_SHADER, vertexShader);
	const fsh = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

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

export function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);

	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const info = gl.getShaderInfoLog(shader);
		throw `Could not compile shader (id=${shader}). \n\n${info}`;
	}

	return shader;
}
