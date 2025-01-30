import * as MatrixUtil from "../util/matrix_util.js";
import * as OBJLoader from "../util/obj_loader.js";
import * as ShaderLoader from "../util/shader_loader.js";
import * as TextureLoader from "../util/texture_loader.js";

const perspective = MatrixUtil.perspective;
const lookAt = MatrixUtil.lookAt;
const loadOBJ = OBJLoader.loadOBJ;
const loadProgram = ShaderLoader.loadProgram;
const loadTexture = TextureLoader.loadTexture;

const viewObjects = new Map();
const properties = new Map();

start();

async function start() {
	const url = window.location.href;
	const searchParams = new URLSearchParams(new URL(url).searchParams);

	const tutorialId = searchParams.get("id");
	const config = await fetch("./" + tutorialId + "/" + "config.json")
		.then(res => res.text())
		.then(JSON.parse);

	document.title = config.title;

	for (const view of config.views) {
		const e = document.createElement("canvas");
		e.id = view.id;
		e.width = view.width;
		e.height = view.height;
		document.body.appendChild(e);
		document.body.appendChild(document.createElement("br"));

		var o = {
			init: eval(await fetch("./" + tutorialId + "/" + view.id + "_init.js").then(res => res.text())),
			loop: eval(await fetch("./" + tutorialId + "/" + view.id + "_loop.js").then(res => res.text()))
		};
		o.id = view.id;
		viewObjects.set(view.id, o);

		const gl = e.getContext("webgl2");
		await o.init(gl);
	}

	document.body.appendChild(document.createElement("br"));

	for (const property of config.properties) {
		const e1 = document.createElement("label");
		e1.for = property.name;
		e1.innerHTML = property.name + ":";
		const e0 = document.createElement("input");
		e0.type = "text";
		e0.id = property.name;
		e0.name = property.name;
		e0.value = property.default;
		document.body.appendChild(e1);
		document.body.appendChild(document.createElement("br"));
		document.body.appendChild(e0);
		document.body.appendChild(document.createElement("br"));
		
		properties.set(property.name, eval(property.default));
	}

	requestAnimationFrame(renderLoop);
}

function renderLoop(time) {
	// update properties
	for (const propEntry of properties.entries()) {
		const e = document.getElementById(propEntry[0]);
		try {
			properties.set(propEntry[0], eval(e.value));
		} catch (error) {
			// ignore
		}
	}

	for (const viewEntry of viewObjects.entries()) {
		const e = document.getElementById(viewEntry[0]);
		const gl = e.getContext("webgl2");
		viewEntry[1].loop(gl, time, properties);
	}

	requestAnimationFrame(renderLoop);
}
