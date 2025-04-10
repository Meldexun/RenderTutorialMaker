import { fetchProgram } from "./shader_loader.js";
import { mat4 } from "gl-matrix";

export async function createFrustumRenderer(gl) {
	const program = await fetchProgram(gl, "position_color.vsh", "position_color.fsh");
	const u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
	const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
	const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
	const a_Position = gl.getAttribLocation(program, "a_Position");
	const a_Color = gl.getAttribLocation(program, "a_Color");

	// create line buffer
	const lineBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		-1.0, 1.0, -1.0,
		-1.0, 1.0, -1.0,
		-1.0, -1.0, -1.0,

		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0,

		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0
	]), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// create near plane buffer
	const nearFaceBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nearFaceBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		-1.0, 1.0, -1.0,
		-1.0, -1.0, -1.0,
	]), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// create far plane buffer
	const farFaceBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, farFaceBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0
	]), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return {
		program: program,
		u_ProjectionMatrix: u_ProjectionMatrix,
		u_ViewMatrix: u_ViewMatrix,
		u_ModelMatrix: u_ModelMatrix,
		a_Position: a_Position,
		a_Color: a_Color,
		lineBuffer: lineBuffer,
		nearFaceBuffer: nearFaceBuffer,
		farFaceBuffer: farFaceBuffer,
		dispose(gl) {
			for (let bufferName of ["lineBuffer", "nearFaceBuffer", "farFaceBuffer"]) {
				if (bufferName in this) {
					gl.deleteBuffer(this[bufferName]);
					delete this[bufferName];
				}
			}
		},
		render(gl, projection, view, frustumProjection, frustumView) {
			let invertedProjViewMatrix;
			try {
				invertedProjViewMatrix = mat4.invert(
					mat4.create(),
					mat4.mul(
						mat4.create(),
						frustumProjection,
						frustumView
					)
				);
			} catch (err) {
				// invert failed -> skip rendering
				return false;
			}
			if (!invertedProjViewMatrix) {
				// invert failed -> skip rendering
				return false;
			}

			gl.useProgram(this.program);
			gl.uniformMatrix4fv(this.u_ProjectionMatrix, false, projection);
			gl.uniformMatrix4fv(this.u_ViewMatrix, false, view);
			gl.uniformMatrix4fv(this.u_ModelMatrix, false, invertedProjViewMatrix);

			gl.enableVertexAttribArray(this.a_Position);

			// render lines
			gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
			gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.vertexAttrib4f(this.a_Color, 1.0, 1.0, 1.0, 1.0);
			gl.drawArrays(gl.LINES, 0, 24);

			// render near plane
			gl.bindBuffer(gl.ARRAY_BUFFER, this.nearFaceBuffer);
			gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.vertexAttrib4f(this.a_Color, 1.0, 1.0, 0.5, 0.5);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			// render far plane
			gl.bindBuffer(gl.ARRAY_BUFFER, this.farFaceBuffer);
			gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.vertexAttrib4f(this.a_Color, 0.5, 0.5, 1.0, 0.5);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			gl.disableVertexAttribArray(this.a_Position);

			gl.useProgram(null);
			return true;
		}
	};
}
