
export async function fetchProgram(gl, vertexShader, fragmentShader) {
	const vertexResponse = await fetch(vertexShader);
	if (vertexResponse.status >= 400) {
		throw new Error(`${vertexResponse.status} ${vertexResponse.statusText}: Can't fetch shader from "${vertexShader}"`);
	}
	const fragmentResponse = await fetch(fragmentShader);
	if (fragmentResponse.status >= 400) {
		throw new Error(`${fragmentResponse.status} ${fragmentResponse.statusText}: Can't fetch shader from "${fragmentShader}"`);
	}
	return loadProgram(gl, await vertexResponse.test(), await fragmentResponse.text());
}

export function loadProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	const vsh = loadShader(gl, gl.VERTEX_SHADER, vertexShader);
	const fsh = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

	gl.attachShader(program, vsh);
	gl.attachShader(program, fsh);

	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const info = gl.getProgramInfoLog(program);
		throw `Could not link program (id=${program}):\r\n${info}`;
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
		const name = type === gl.FRAGMENT_SHADER ? "fragment" : "vertex";
		const info = gl.getShaderInfoLog(shader);
		throw `Could not compile ${name} shader (id=${shader}):\r\n${info}`;
	}

	return shader;
}
