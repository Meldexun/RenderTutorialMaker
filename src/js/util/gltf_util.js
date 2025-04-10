import { GLTFLoader, postProcessGLTF } from "@loaders.gl/gltf";
import { load } from "@loaders.gl/core";
import { mat4 } from "gl-matrix";

export async function loadGLTF(url) {
	return load(url, GLTFLoader);
}

export async function loadProcessedGLTF(name) {
	return loadGLTF(name).then(postProcessGLTF);
}

export async function loadAndInitGLTF(gl, name) {
	return loadProcessedGLTF(name).then(gltf => initProcessedGLTF(gl, gltf));
}

export function initProcessedGLTF(gl, gltf) {
	gltf.meshes.forEach(mesh => {
		mesh.primitives.forEach(primitive => {
			Object.values(primitive.attributes).forEach(attribute => {
				attribute.buffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, attribute.value, gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);
			});
			primitive.indices.buffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.indices.buffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, primitive.indices.value, gl.STATIC_DRAW);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		});
	});
	gltf.materials.forEach(material => {
		material.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, material.texture);
		if (material.pbrMetallicRoughness) {
			if (material.pbrMetallicRoughness.baseColorTexture) {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, material.pbrMetallicRoughness.baseColorTexture.texture.source.image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, material.pbrMetallicRoughness.baseColorTexture.texture.sampler.magFilter);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, material.pbrMetallicRoughness.baseColorTexture.texture.sampler.minFilter);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, material.pbrMetallicRoughness.baseColorTexture.texture.sampler.wrapS);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, material.pbrMetallicRoughness.baseColorTexture.texture.sampler.wrapT);
			} else if (material.pbrMetallicRoughness.baseColorFactor) {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(material.pbrMetallicRoughness.baseColorFactor.map(c => c * 255)));
			} else {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
			}
		} else {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
		}
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	});
	return gltf;
}

export function disposeGLTF(gl, gltf) {
	gltf.meshes.forEach(mesh => {
		mesh.primitives.forEach(primitive => {
			Object.values(primitive.attributes).forEach(attribute => {
				if (attribute.buffer) {
					gl.deleteBuffer(attribute.buffer);
					delete attribute.buffer;
				}
			});
			if (primitive.indices.buffer) {
				gl.deleteBuffer(primitive.indices.buffer);
				delete primitive.indices.buffer;
			}
		});
	});
	gltf.materials.forEach(material => {
		if (material.texture) {
			gl.deleteTexture(material.texture);
			delete material.texture;
		}
	});
}

export function createModelProvider(gl, urlSupplier) {
	return {
		loader: null,
		update() {
			const url = urlSupplier();
			if (this.loader == null || this.loader.url !== url) {
				if (this.loader != null) {
					this.loader.promise.then(model => disposeGLTF(gl, model));
					this.loader = null;
				}
				const loader = {
					url: url,
					model: null,
					promise: loadAndInitGLTF(gl, url).then(model => loader.model = model)
				};
				this.loader = loader;
			}
		},
		getModel() {
			this.update();
			return this.loader != null ? this.loader.model : null;
		}
	};
}

export function renderGLTF(gl, gltf, modelMatrix = mat4.create()) {
	const program = gl.getParameter(gl.CURRENT_PROGRAM);
	const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
	const u_Texture = gl.getUniformLocation(program, "u_Texture");
	const attributeMap = {
		POSITION: gl.getAttribLocation(program, "a_Position"),
		TEXCOORD_0: gl.getAttribLocation(program, "a_Texture"),
		COLOR_0: gl.getAttribLocation(program, "a_Color"),
		NORMAL: gl.getAttribLocation(program, "a_Normal")
	}

	const matrixStack = [modelMatrix];
	iterateScene(gltf.scene, node => {
		// push updated model matrix
		if (node.matrix) {
			matrixStack.push(mat4.mul(
				mat4.create(),
				matrixStack[matrixStack.length - 1],
				node.matrix
			));
		} else if (node.translation || node.rotation || node.scale) {
			matrixStack.push(mat4.mul(
				mat4.create(),
				matrixStack[matrixStack.length - 1],
				mat4.fromRotationTranslationScale(
					mat4.create(),
					node.rotation || [0, 0, 0, 1],
					node.translation || [0, 0, 0],
					node.scale || [1, 1, 1]
				)
			));
		} else {
			matrixStack.push(mat4.copy(
				mat4.create(),
				matrixStack[matrixStack.length - 1]
			));
		}
//		if (matrixStack.length == 2) {
//			console.log(matrixStack[1]);
//			console.log(mat4.rotateZ(matrixStack[1], matrixStack[1], -90.0 / 180 * Math.PI));
//		}

		// render mesh if present
		if (node.mesh) {
			gl.uniformMatrix4fv(u_ModelMatrix, false, matrixStack[matrixStack.length - 1]);

			node.mesh.primitives.forEach(primitive => {
				// setup vertex attributes
				for (let attributeName in attributeMap) {
					const location = attributeMap[attributeName];
					if (location >= 0) {
						const attribute = primitive.attributes[attributeName];
						if (attribute) {
							gl.enableVertexAttribArray(location);
							gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
							gl.vertexAttribPointer(location, attribute.components, attribute.componentType, false, 0, 0);
							gl.bindBuffer(gl.ARRAY_BUFFER, null);
						} else {
							gl.vertexAttrib4f(location, 1.0, 1.0, 1.0, 1.0);
						}
					}
				}

				// bind material if present
				if (primitive.material) {
					gl.bindTexture(gl.TEXTURE_2D, primitive.material.texture);
					gl.uniform1i(u_Texture, 0);
				} else {
					gl.bindTexture(gl.TEXTURE_2D, null);
					gl.uniform1i(u_Texture, 0);
				}

				// draw model
				if (primitive.indices) {
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.indices.buffer);
					gl.drawElements(primitive.mode ?? gl.TRIANGLES, primitive.indices.count, primitive.indices.componentType, 0);
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
				} else {
					gl.drawArrays(primitive.mode ?? gl.TRIANGLES, 0, Object.values(primitive.attributes)[0].count);
				}

				// disable vertex attributes
				for (let attributeName in attributeMap) {
					const location = attributeMap[attributeName];
					const attribute = primitive.attributes[attributeName];
					if (location >= 0 && attribute) {
						gl.disableVertexAttribArray(location);
					}
				}
			});
		}
	}, _ => {
		// pop model matrix
		matrixStack.pop();
	});
}

export function iterateScene(scene, processNode, postProcessNode = () => { }) {
	function processRecursive(node, process, postProcess) {
		process(node);
		if (node.children) {
			node.children.forEach(child => processRecursive(child, process, postProcess));
		}
		postProcess(node);
	}
	scene.nodes.forEach(node => processRecursive(node, processNode, postProcessNode));
}
