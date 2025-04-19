import * as ShaderLoader from "./util/shader_loader.js";
import * as TextureLoader from "./util/texture_loader.js";
import * as GLMatrix from "gl-matrix";
import * as GLTF from "./util/gltf_util.js";
import * as RenderUtil from "./util/render_util.js";

import json5 from "json5";
import { EditorView, basicSetup } from "codemirror";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { Prec } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { autocomplete_thin } from "./util/autocomplete_js";
import { autocomplete_glsl } from "./util/autocomplete_glsl";
import { githubDark } from '@uiw/codemirror-theme-github';

// workaround to make dependencies available in eval expressions
const fetchProgram = ShaderLoader.fetchProgram;
const loadProgram = ShaderLoader.loadProgram;
const loadShader = ShaderLoader.loadShader;
const loadTexture = TextureLoader.loadTexture;
const vec2 = GLMatrix.vec2;
const vec3 = GLMatrix.vec3;
const vec4 = GLMatrix.vec4;
const mat2 = GLMatrix.mat2;
const mat3 = GLMatrix.mat3;
const mat4 = GLMatrix.mat4;
const toRadian = GLMatrix.glMatrix.toRadian;
const loadGLTF = GLTF.loadGLTF;
const initProcessedGLTF = GLTF.initProcessedGLTF;
const loadAndInitGLTF = GLTF.loadAndInitGLTF;
const disposeGLTF = GLTF.disposeGLTF;
const createModelProvider = GLTF.createModelProvider;
const renderGLTF = GLTF.renderGLTF;
const createFrustumRenderer = RenderUtil.createFrustumRenderer;

class View {

	constructor(name, width, height, initFunc, drawFunc) {
		this.name = name;
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style = "width: " + width + "px;" + " " + "height: " + height + "px;";
		this.gl = this.canvas.getContext("webgl2");
		this.initFunc = initFunc;
		this.drawFunc = drawFunc;
		this.container = document.createElement("div");
		this.container.className = "view";
		this.container.appendChild(createElement("label", label => {
			label.textContent = name;
		}));
		this.container.appendChild(this.canvas);
	}

	async init() {
		await this.initFunc(this.gl);
	}

	draw(time) {
		this.drawFunc(this.gl, time);
	}

	setupCamera3D(initialPosition = vec3.create(), initialPitch = 0.0, initialYaw = 0.0, initialZoom = -10.0, onChangeCallback = () => { }) {
		this.cameraPosition = initialPosition;
		this.cameraPitch = Math.min(Math.max(initialPitch, -90.0), 90.0);
		this.cameraYaw = initialYaw;
		this.cameraZoom = Math.min(Math.max(initialZoom, -1000.0), -0.01);

		this.canvas.onmousedown = ev => {
			if (ev.button === 0) {
				this.isDraggingLeft = true;
			}
			if (ev.button === 2) {
				this.isDraggingRight = true;
			}
		};
		document.addEventListener("mousemove", ev => {
			const deltaX = -this.mouseX + (this.mouseX = ev.screenX);
			const deltaY = -this.mouseY + (this.mouseY = ev.screenY);

			if (this.isDraggingLeft) {
				this.cameraPitch = Math.min(Math.max(this.cameraPitch + deltaY, -90.0), 90.0);
				this.cameraYaw += deltaX;
				onChangeCallback();
			}
			if (this.isDraggingRight) {
				this.cameraPosition = vec3.add(
					vec3.create(),
					this.cameraPosition,
					vec3.scale(
						vec3.create(),
						vec3.rotateY(
							vec3.create(),
							vec3.rotateX(
								vec3.create(),
								vec3.set(vec3.create(), 0.0, 1.0, 0.0),
								vec3.create(),
								toRadian(-this.cameraPitch)
							),
							vec3.create(),
							toRadian(-this.cameraYaw)
						),
						-deltaY * 0.25
					)
				);
				this.cameraPosition = vec3.add(
					vec3.create(),
					this.cameraPosition,
					vec3.scale(
						vec3.create(),
						vec3.rotateY(
							vec3.create(),
							vec3.set(vec3.create(), 1.0, 0.0, 0.0),
							vec3.create(),
							toRadian(-this.cameraYaw)
						),
						deltaX * 0.25
					)
				);
				onChangeCallback();
			}
		});
		document.addEventListener("mouseup", ev => {
			if (this.isDraggingLeft && ev.button === 0) {
				this.isDraggingLeft = false;
			}
			if (this.isDraggingRight && ev.button === 2) {
				this.isDraggingRight = false;
				this.cancelContextMenu = true;
			}
		});
		document.addEventListener("contextmenu", ev => {
			if (this.cancelContextMenu) {
				this.cancelContextMenu = false;
				ev.preventDefault();
			}
		});
		this.canvas.onwheel = ev => {
			this.cameraZoom = Math.min(Math.max(this.cameraZoom + ev.wheelDelta * 0.1, this.cameraZoom * 1.5, -1000.0), this.cameraZoom * 0.75, -0.01);
			ev.preventDefault();
			onChangeCallback();
		};
		onChangeCallback();
	}

	getCamera3D() {
		return mat4.translate(
			mat4.create(),
			mat4.rotateY(
				mat4.create(),
				mat4.rotateX(
					mat4.create(),
					mat4.translate(
						mat4.create(),
						mat4.create(),
						vec3.set(vec3.create(), 0.0, 0.0, this.cameraZoom)
					),
					toRadian(this.cameraPitch)
				),
				toRadian(this.cameraYaw)
			),
			vec3.set(vec3.create(), this.cameraPosition[0], this.cameraPosition[1], this.cameraPosition[2])
		);
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

const views = new Map();
const properties = new Map();

try {
	await start();

	requestAnimationFrame(draw);
} catch (err) {
	let errorMessage = "An error occured during initialization. Please contact the tutorial author to get this issue resolved.<br><br>";
	let error = err;
	while (error) {
		errorMessage += error.toString();
		errorMessage += "<br>";
		if (!error.parent) {
			if (error.stack) {
				errorMessage += error.stack.split(/\r?\n/).map(s => "    " + s).join("<br>");
				errorMessage += "<br>";
			}
			break;
		}
		error = error.parent;
	}
	document.querySelector("main").replaceChildren(createElement("pre", pre => pre.innerHTML = errorMessage));
}

// loads the tutorial and initializes the views and properties
async function start() {
	// parse tutorial id from url search parameters
	const searchParams = new URLSearchParams(new URL(window.location.href).searchParams);
	const tutorialId = searchParams.get("id");
	if (!tutorialId) {
		throw new Error("No tutorial selected!");
	}
	const tutorialDirectory = "/tutorials/" + tutorialId + "/";

	// load tutorial configuration json
	const tutorialResponse = await fetch(tutorialDirectory + "config.json");
	if (tutorialResponse.status >= 400) {
		throw new Error(`${tutorialResponse.status} ${tutorialResponse.statusText}: Can't fetch tutorial from "${tutorialDirectory + "config.json"}"`);
	}
	const tutorialJson = await tutorialResponse.text();
	let tutorialConfig;
	try {
		tutorialConfig = json5.parse(tutorialJson);
	} catch (err) {
		const e = new Error(`Failed parsing tutorial json!`, err);
		e.parent = err;
		throw e;
	}

	// load views
	const viewsContainer = document.createElement("div");
	viewsContainer.className = "views";
	for (const viewConfig of tutorialConfig.views) {
		if (!viewConfig.name) {
			throw new Error(`View is missing name`)
		}
		if (views.has(viewConfig.name)) {
			throw new Error(`Duplicate view with name "${viewConfig.name}"`)
		}

		try {
			const initFunc = eval(await fetch(tutorialDirectory + viewConfig.name + "_init.js").then(res => res.text()));
			const drawFunc = eval(await fetch(tutorialDirectory + viewConfig.name + "_loop.js").then(res => res.text()));
			const view = new View(viewConfig.name, viewConfig.width, viewConfig.height, initFunc, drawFunc);
			views.set(viewConfig.name, view);
			viewsContainer.appendChild(view.container);
		} catch (err) {
			const e = Error(`Failed loading view "${viewConfig.name}"`, err);
			e.parent = err;
			throw e;
		}
	}

	// load properties
	const propertiesContainer = document.createElement("div");
	propertiesContainer.className = "properties";
	for (const propertyConfig of tutorialConfig.properties) {
		if (!propertyConfig.name) {
			throw new Error(`Property is missing name`)
		}
		if (properties.has(propertyConfig.name)) {
			throw new Error(`Duplicate property with name "${propertyConfig.name}"`)
		}

		try {
			const property = new Property(propertyConfig.name);

			const propertyContainer = document.createElement("div");
			propertyContainer.className = "property";
			propertyContainer.appendChild(createElement("div", header => {
				header.className = "property-header";
				header.appendChild(createElement("label", label => {
					label.textContent = property.name;
				}));

				// load presets
				if (propertyConfig.presets) {
					header.appendChild(createElement("select", select => {
						for (let preset of propertyConfig.presets) {
							select.appendChild(createElement("option", option => {
								option.value = preset.value;
								option.textContent = preset.name;
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
							for (let option of select.options) {
								if (eval(option.value) === value) {
									select.value = option.value;
									break;
								}
							}
						});
					}));
				}
			}));

			// load different input options based on property type
			const propertyInputs = document.createElement("div");
			propertyInputs.className = "property-inputs";
			switch (propertyConfig.type) {
				case "boolean":
					if (propertyConfig.input_checkbox === true) {
						propertyInputs.appendChild(createElement("input", input => {
							input.type = "checkbox";
							input.onchange = () => property.setValue(input.checked);
							property.addListener(value => input.checked = value);
						}));
					}
					break;
				case "number":
					if (propertyConfig.input_number === true) {
						propertyInputs.appendChild(createElement("input", input => {
							input.type = "number";
							input.min = propertyConfig.min ?? -10.0;
							input.max = propertyConfig.max ?? 10.0;
							input.step = propertyConfig.step ?? "any";
							input.onchange = () => property.setValue(input.value);
							property.addListener(value => input.value = value);
						}));
					}
					if (propertyConfig.input_slider === true) {
						propertyInputs.appendChild(createElement("input", input => {
							input.type = "range";
							input.min = propertyConfig.min ?? -10.0;
							input.max = propertyConfig.max ?? 10.0;
							input.step = propertyConfig.step ?? "any";
							input.oninput = () => property.setValue(input.value);
							property.addListener(value => input.value = value);
						}));
					}
					break;
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
									input.min = propertyConfig.min ?? -10.0;
									input.max = propertyConfig.max ?? 10.0;
									input.step = propertyConfig.step ?? "any";
									input.onchange = () => property.setValue(inputs.map(input => input.value));
								});
							}
						}
						for (let col = 0; col < cols; col++) {
							const rowContainer = document.createElement("div");
							for (let row = 0; row < rows; row++) {
								rowContainer.appendChild(inputs[row * cols + col]);
							}
							propertyInputs.appendChild(rowContainer);
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
									input.min = propertyConfig.min ?? -10.0;
									input.max = propertyConfig.max ?? 10.0;
									input.step = propertyConfig.step ?? "any";
									input.oninput = () => property.setValue(inputs.map(input => input.value));
								});
							}
						}
						for (let col = 0; col < cols; col++) {
							const rowContainer = document.createElement("div");
							for (let row = 0; row < rows; row++) {
								rowContainer.appendChild(inputs[row * cols + col]);
							}
							propertyInputs.appendChild(rowContainer);
						}
						property.addListener(value => {
							for (let i in inputs) {
								inputs[i].value = value[i];
							}
						});
					}
					break;
				case "string (single-line)":
				case "string (multi-line)":
					if (propertyConfig.type === "string (single-line)" && propertyConfig.input_text === true
						|| propertyConfig.type === "string (multi-line)" && propertyConfig.input_textarea === true) {
						// default extensions
						const extensions = [
							basicSetup,
							githubDark,
							EditorView.updateListener.of(update => {
								if (update.docChanged) {
									property.setValue(update.state.doc.toString());
								}
							})
						];
						// language support
						if (propertyConfig.language === "JavaScript") {
							extensions.push(javascript());
							extensions.push(autocomplete_thin);
						}
						if (propertyConfig.language === "GLSL") {
							extensions.push(autocomplete_glsl);
						}
						// disable entry, paste and drop for single-line
						if (propertyConfig.type === "string (single-line)") {
							extensions.push(Prec.high(keymap.of([{
								key: "Enter",
								run() {
									return true;
								}
							}])));
							extensions.push(EditorView.domEventHandlers({
								paste(ev) {
									ev.preventDefault();
								},
								drop(ev) {
									ev.preventDefault();
								}
							}));
						}
						if (propertyConfig.type === "string (multi-line)") {
							extensions.push(keymap.of(indentWithTab));
						}
						const container = document.createElement("div");
						container.className = "editor-" + (propertyConfig.type === "string (single-line)" ? "single" : "multi");
						const editor = property.editor = new EditorView({
							parent: container,
							extensions: extensions
						});
						propertyInputs.appendChild(container);
						property.addListener(value => {
							if (editor.state.doc.toString() !== value) {
								editor.dispatch({
									changes: {
										from: 0,
										to: editor.state.doc.length,
										insert: value
									}
								});
							}
						});
					}
					break;
			}
			if (propertyInputs.hasChildNodes()) {
				propertyContainer.appendChild(propertyInputs);
			}

			properties.set(property.name, property);
			propertiesContainer.appendChild(propertyContainer);

			// set default value
			property.setValue(eval(propertyConfig.default));
		} catch (err) {
			const e = Error(`Failed loading property "${propertyConfig.name}"`, err);
			e.parent = err;
			throw e;
		}
	}

	// initialize views
	for (const view of views.values()) {
		try {
			await view.init();
		} catch (err) {
			const e = Error(`Failed initializing view "${view.name}"`, err);
			e.parent = err;
			throw e;
		}
	}

	// tutorial loaded successfully, set title and display tutorial
	document.title = tutorialConfig.name;
	const tutorialContainer = document.createElement("div");
	tutorialContainer.className = "tutorial";
	tutorialContainer.appendChild(createElement("div", header => {
		header.className = "tutorial-header";
		header.appendChild(createElement("h1", title => {
			title.textContent = tutorialConfig.name;
		}));
		header.appendChild(createElement("button", edit => {
			edit.type = "button";
			edit.textContent = "Open in Editor";
			edit.onclick = _ => window.open("/edit?id=" + tutorialId);
		}));
	}));
	tutorialContainer.appendChild(document.createElement("hr"));
	tutorialContainer.appendChild(createElement("p", paragraph => {
		paragraph.className = "description";
		paragraph.innerHTML = tutorialConfig.description || "";
	}));
	tutorialContainer.appendChild(document.createElement("hr"));
	tutorialContainer.appendChild(createElement("h2", title => {
		title.textContent = "Views";
	}));
	tutorialContainer.appendChild(viewsContainer);
	tutorialContainer.appendChild(document.createElement("hr"));
	tutorialContainer.appendChild(createElement("h2", title => {
		title.textContent = "Properties";
	}));
	tutorialContainer.appendChild(propertiesContainer);
	document.querySelector("main").replaceChildren(tutorialContainer);
}

// called every frame to update the views
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

// helper function to create html element with optional callback argument
function createElement(type, callback = undefined) {
	const element = document.createElement(type);
	if (callback) {
		callback(element);
	}
	return element;
}
