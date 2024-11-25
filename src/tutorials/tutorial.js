const jszip = require('jszip');
const json5 = require('json5');

const viewObjects = new Map();
const properties = new Map();
properties.set("Projection", perspective(60.0, 16.0 / 9.0, 0.5, 10.0));

start();

async function start() {
	const zip = await fetch("projection.zip")
		.then(res => res.blob())
		.then(jszip.loadAsync);
	const config = await zip.file("config.json")
		.async("string")
		.then(json5.parse);

	document.title = config.title;

	for (const view of config.views) {
		const e = document.createElement("canvas");
		e.id = view.id;
		e.width = view.width;
		e.height = view.height;
		document.body.appendChild(e);

		var o = {
			init: eval(await zip.file(view.id + "_init.js").async("string")),
			loop: eval(await zip.file(view.id + "_loop.js").async("string"))
		};
		o.id = view.id;
		viewObjects.set(view.id, o);

		const gl = e.getContext("webgl2");
		await o.init(gl);
	}

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
		document.body.appendChild(e0);
		
		properties.set(property.name, eval(property.default));
	}

	requestAnimationFrame(renderLoop);
}

function renderLoop(time) {
	for (const viewEntry of viewObjects.entries()) {
		const e = document.getElementById(viewEntry[0]);
		const gl = e.getContext("webgl2");
		viewEntry[1].loop(gl, time, properties);
	}

	requestAnimationFrame(renderLoop);
}
