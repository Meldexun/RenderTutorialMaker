const OBJ = require('webgl-obj-loader');

window.loadOBJ = async function loadOBJ(gl, source) {
	var mesh = new OBJ.Mesh(await (fetch(source).then(res => res.text())));
	OBJ.initMeshBuffers(gl, mesh);
	return mesh;
}
