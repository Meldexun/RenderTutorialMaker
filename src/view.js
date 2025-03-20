import * as ShaderLoader from "./util/shader_loader.js";
import * as TextureLoader from "./util/texture_loader.js";
import * as GLMatrix from "gl-matrix";
import * as Loaders from "@loaders.gl/core";
import * as GLTF from "@loaders.gl/gltf";

const loadProgram = ShaderLoader.loadProgram;
const loadShader = ShaderLoader.loadShader;
const loadTexture = TextureLoader.loadTexture;
const vec2 = GLMatrix.vec2;
const vec3 = GLMatrix.vec3;
const vec4 = GLMatrix.vec4;
const mat2 = GLMatrix.mat2;
const mat3 = GLMatrix.mat3;
const mat4 = GLMatrix.mat4;
const toRadians = GLMatrix.glMatrix.toRadian;

async function loadGLTF(source) {
	const gltf = await Loaders.load(source, GLTF.GLTFLoader);
	gltf.model = GLTF.postProcessGLTF(gltf);
	return gltf;
}

class View {

	constructor(canvas, initFunc, drawFunc) {
		this.canvas = canvas;
		this.gl = canvas.getContext("webgl2");
		this.initFunc = initFunc;
		this.drawFunc = drawFunc;
	}

	async init() {
		await this.initFunc(this.gl);
	}

	draw(time, properties) {
		this.drawFunc(this.gl, time, properties);
	}

}

class Property {

	constructor(name, defaultValue) {
		this.name = name;
		this.value = defaultValue;
		this.listeners = [];
	}

	addListener(listener) {
		this.listeners.push(listener);
	}

	setValue(newValue) {
		if (this.value !== newValue) {
			this.value = newValue;
			this.listeners.forEach(listener => listener(newValue));
		}
	}

	getValue() {
		return this.value;
	}

}

const views = [];
const properties = new Map();

try {
	await start();

	requestAnimationFrame(draw);
} catch (error) {
	const errorMessage = document.createElement("pre");
	const stackTrace = error.stack.split(new RegExp("\r?\n")).map(s => "    " + s).join("<br>");
	errorMessage.innerHTML = "An error occured during initialization. Please contact the tutorial author to get this issue resolved.<br>" + error + "<br>" + stackTrace;
	document.querySelector("main").replaceChildren(errorMessage);
}

async function start() {
	const searchParams = new URLSearchParams(new URL(window.location.href).searchParams);
	const tutorialId = searchParams.get("id");
	if (!tutorialId) {
		throw new Error("No tutorial selected");
	}
	const tutorialDirectory = "./tutorials/" + tutorialId + "/";

	const tutorialConfig = await fetch(tutorialDirectory + "config.json")
		.then(res => res.text())
		.then(JSON.parse);

	const tutorialContainer = document.createElement("div");

	const viewsContainer = document.createElement("div");
	viewsContainer.className = "views";
	for (const viewConfig of tutorialConfig.views) {
		const canvas = document.createElement("canvas");
		canvas.id = viewConfig.id;
		canvas.width = viewConfig.width;
		canvas.height = viewConfig.height;
		canvas.style = "width: " + viewConfig.width + "px;" + " " + "height: " + viewConfig.height + "px;";
		viewsContainer.appendChild(canvas);

		const initFunc = eval(await fetch(tutorialDirectory + viewConfig.id + "_init.js").then(res => res.text()));
		const drawFunc = eval(await fetch(tutorialDirectory + viewConfig.id + "_loop.js").then(res => res.text()));

		const view = new View(canvas, initFunc, drawFunc);
		await view.init();
		views.push(view);
	}
	tutorialContainer.appendChild(viewsContainer);

	const propertiesContainer = document.createElement("div");
	propertiesContainer.className = "properties";
	for (const propertyConfig of tutorialConfig.properties) {
		const property = new Property(propertyConfig.name);
		properties.set(property.name, property);

		const propertyContainer = document.createElement("div");
		propertyContainer.className = "property";
		propertyContainer.appendChild(createElement("label", label => {
			label.textContent = propertyConfig.name;
		}));
		if (propertyConfig.input_presets && propertyConfig["preset_0"]) {
			propertyContainer.appendChild(createElement("select", select => {
				for (let i = 0; propertyConfig["preset_" + i]; i++) {
					select.appendChild(createElement("option", option => {
						option.value = propertyConfig["preset_" + i];
						option.textContent = propertyConfig["preset_" + i];
					}));
				}
				select.onchange = () => {
					property.setValue(eval(select.value));
				};
				property.addListener(value => {
					const oldValue = eval(select.value);
					if (oldValue && oldValue.toString() !== value.toString()) {
						select.value = "";
					}
				});
			}));
		}
		switch (propertyConfig.type) {
			case "boolean":
				if (propertyConfig.input_checkbox === true) {
					propertyContainer.appendChild(createElement("input", input => {
						input.type = "checkbox";
						input.onchange = () => property.setValue(input.checked);
						property.addListener(value => input.checked = value);
					}));
				}
				break;
			case "number":
			case "vec2":
			case "vec3":
			case "vec4":
			case "mat2":
			case "mat3":
			case "mat4":
				if (propertyConfig.input_number === true) {
					const rows = propertyConfig.type !== "number" ? Number(propertyConfig.type.substring(3)) : 1;
					const cols = propertyConfig.type.startsWith("mat") ? rows : 1;
					const inputs = [];
					for (let col = 0; col < cols; col++) {
						for (let row = 0; row < rows; row++) {
							inputs[row * cols + col] = createElement("input", input => {
								input.type = "number";
								input.onchange = () => property.setValue(inputs.map(input => input.value));
							});
						}
					}
					for (let col = 0; col < cols; col++) {
						const rowContainer = document.createElement("div");
						for (let row = 0; row < rows; row++) {
							rowContainer.appendChild(inputs[row * cols + col]);
						}
						propertyContainer.appendChild(rowContainer);
					}
					property.addListener(value => {
						for (let i in inputs) {
							inputs[i].value = value[i];
						}
					});
				}

				if (propertyConfig.input_slider === true) {
					const rows = propertyConfig.type !== "number" ? Number(propertyConfig.type.substring(3)) : 1;
					const cols = propertyConfig.type.startsWith("mat") ? rows : 1;
					const inputs = [];
					for (let col = 0; col < cols; col++) {
						for (let row = 0; row < rows; row++) {
							inputs[row * cols + col] = createElement("input", input => {
								input.type = "range";
								input.min = propertyConfig.min;
								input.max = propertyConfig.max;
								input.step = "any";
								input.onchange = () => property.setValue(inputs.map(input => input.value));
							});
						}
					}
					for (let col = 0; col < cols; col++) {
						const rowContainer = document.createElement("div");
						for (let row = 0; row < rows; row++) {
							rowContainer.appendChild(inputs[row * cols + col]);
						}
						propertyContainer.appendChild(rowContainer);
					}
					property.addListener(value => {
						for (let i in inputs) {
							inputs[i].value = value[i];
						}
					});
				}
				break;
			case "string (single-line)":
				if (propertyConfig.input_text === true) {
					propertyContainer.appendChild(createElement("input", input => {
						input.type = "text";
						input.onchange = () => property.setValue(input.checked);
						property.addListener(value => input.checked = value);
					}));
				}
				break;
			case "string (multi-line)":
				if (propertyConfig.input_textarea === true) {
					propertyContainer.appendChild(createElement("input", input => {
						input.type = "textarea";
						input.onchange = () => property.setValue(input.checked);
						property.addListener(value => input.checked = value);
					}));
				}
				break;
		}
		propertiesContainer.appendChild(propertyContainer);

		property.setValue(eval(propertyConfig.default));
	}
	tutorialContainer.appendChild(propertiesContainer);

	document.title = tutorialConfig.title;
	document.querySelector("main").replaceChildren(tutorialContainer);
}

function draw(time) {
	try {
		// create property map
		const propertyMap = new Map();
		properties.forEach((v, k) => propertyMap.set(k, v.getValue()));

		// update views
		views.forEach(view => view.draw(time, propertyMap));

		requestAnimationFrame(draw);
	} catch (error) {
		const errorMessage = document.createElement("pre");
		const stackTrace = error.stack.split(new RegExp("\r?\n")).map(s => "    " + s).join("<br>");
		errorMessage.innerHTML = "An error occured during rendering. Please contact the tutorial author to get this issue resolved.<br>  " + error + "<br>" + stackTrace;
		document.querySelector("main").replaceChildren(errorMessage);
	}
}

function createElement(type, callback = undefined) {
	const element = document.createElement(type);
	if (callback) {
		callback(element);
	}
	return element;
}
