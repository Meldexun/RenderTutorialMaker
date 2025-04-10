import { EditorView, basicSetup } from "codemirror";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { autocomplete_js, autocomplete_thin } from "./util/autocomplete_js";
import { githubDark } from '@uiw/codemirror-theme-github';
import json5 from 'json5';

// create html editor for tutorial description
const descriptionEditor = new EditorView({
	parent: document.getElementById("description").parentNode,
	extensions: [basicSetup, html(), githubDark, EditorView.updateListener.of(update => {
		if (update.docChanged) {
			document.getElementById("description").value = update.state.doc;
		}
	})]
});

class View {

	constructor() {
		this.header = createElement("div", header => {
			header.className = "view-header";

			// create name input
			header.appendChild(this.name = createElement("input", name => {
				name.type = "text";
				name.value = "Unnamed View";
				name.required = true;
			}));

			// create collapse and delete button
			header.appendChild(createElement("div", buttons => {
				buttons.className = "buttons";
				buttons.appendChild(createElement("button", button => {
					button.type = "button";
					button.textContent = "Collapse";
					button.onclick = () => {
						this.main.hidden = !this.main.hidden;
					};
				}));
				buttons.appendChild(createElement("button", button => {
					button.type = "button";
					button.textContent = "Delete";
					button.onclick = () => {
						this.container.remove();
						const index = views.indexOf(this);
						if (index >= 0) {
							views.splice(index, 1);
						}
					};
				}));
			}));
		});

		this.main = createElement("div", main => {
			main.className = "view-main";
		});

		// create width input
		this.width = new LabeledElement("Width", "input", width => {
			width.type = "number";
			width.value = 600;
			width.required = true;
		});
		this.width.container.className = "input-oneline";

		// create height input
		this.height = new LabeledElement("Height", "input", height => {
			height.type = "number";
			height.value = 400;
			height.required = true;
		});
		this.height.container.className = "input-oneline";

		// create init code editor
		this.init = new LabeledEditor("Initialization Code", container => ({
			parent: container,
			extensions: [basicSetup, javascript(), autocomplete_js, githubDark]
		}));

		// create render code editor
		this.loop = new LabeledEditor("Render Code", container => ({
			parent: container,
			extensions: [basicSetup, javascript(), autocomplete_js, githubDark]
		}));

		// build container for this view
		this.container = createElement("div", container => {
			container.className = "view";
			container.appendChild(this.header);
			container.appendChild(this.main);
			this.main.appendChild(this.width.container);
			this.main.appendChild(this.height.container);
			this.main.appendChild(this.init.container);
			this.main.appendChild(this.loop.container);
		});
	}

	toObject() {
		return {
			name: this.name.value,
			width: Number(this.width.element.value),
			height: Number(this.height.element.value),
			init: this.init.editor.state.doc.toString(),
			loop: this.loop.editor.state.doc.toString()
		};
	}

}

class Property {

	constructor() {
		this.header = createElement("div", header => {
			header.className = "property-header";

			// create name input
			header.appendChild(this.name = createElement("input", element => {
				element.type = "text";
				element.value = "Unnamed Property";
				element.required = true;
			}));

			// create delete button
			header.appendChild(createElement("button", button => {
				button.type = "button";
				button.textContent = "Delete";
				button.onclick = () => {
					this.container.remove();
					const index = properties.indexOf(this);
					if (index >= 0) {
						properties.splice(index, 1);
					}
				};
			}));
		});

		// create type input
		this.type = new LabeledElement("Type", "select", type => {
			addOption(type, "boolean");
			addOption(type, "number");
			addOption(type, "vec2");
			addOption(type, "vec3");
			addOption(type, "vec4");
			addOption(type, "mat2");
			addOption(type, "mat3");
			addOption(type, "mat4");
			addOption(type, "string (single-line)");
			addOption(type, "string (multi-line)");
			type.onchange = _ => {
				let replacement = "";
				switch (type.value) {
					case "boolean":
						replacement = "false";
						break;
					case "number":
						replacement = "0";
						break;
					case "vec2":
					case "vec3":
					case "vec4":
					case "mat2":
					case "mat3":
					case "mat4":
						replacement = type.value + ".create()";
						break;
					case "string (single-line)":
					case "string (multi-line)":
					default:
						break;
				}
				this.default.editor.dispatch({
					changes: {
						from: 0,
						to: this.default.editor.state.doc.length,
						insert: replacement
					}
				});

				// show/hide specific property attributes
				this.min.container.style = "display: none";
				this.max.container.style = "display: none";
				this.step.container.style = "display: none";
				this.lang.container.style = "display: none";
				if (/number|(?:vec|mat)\d/.test(type.value)) {
					this.min.container.style = "";
					this.max.container.style = "";
					this.step.container.style = "";
				}
				if (/string \((?:single|multi)-line\)/.test(type.value)) {
					this.lang.container.style = "";
				}

				// remove old presets and hide presets for type boolean
				this.presets.presets.slice().forEach(preset => preset.remove());
				if (type.value === "boolean") {
					this.presets.container.style = "display: none";
				} else {
					this.presets.container.style = "";
				}
			};
		});
		this.type.container.className = "input-oneline";

		// create default input
		this.default = new LabeledEditor("Default", container => ({
			parent: container,
			extensions: [basicSetup, javascript(), autocomplete_thin, githubDark]
		}));
		this.default.container.className = "input-oneline";

		// create min, max, step inputs (only for number, vector and matrix types)
		this.min = new LabeledElement("Min", "input", min => {
			min.type = "number";
		});
		this.min.container.className = "input-oneline";
		this.max = new LabeledElement("Max", "input", max => {
			max.type = "number";
		});
		this.max.container.className = "input-oneline";
		this.step = new LabeledElement("Step", "input", step => {
			step.type = "number";
		});
		this.step.container.className = "input-oneline";

		// create language input (only for string types)
		this.lang = new LabeledElement("Language", "select", lang => {
			addOption(lang, "Plain-Text");
			addOption(lang, "JavaScript");
		});
		this.lang.container.className = "input-oneline";

		// create input options (individual options get hidden/shown when type changes)
		this.inputs = {
			container: document.createElement("div"),
			elements: []
		};

		// create preset option (gets hidden when type is boolean)
		this.presets = new Presets();

		this.container = createElement("div", container => {
			container.className = "property";
			container.appendChild(this.header);
			container.appendChild(this.type.container);
			container.appendChild(this.default.container);
			container.appendChild(this.min.container);
			container.appendChild(this.max.container);
			container.appendChild(this.step.container);
			container.appendChild(this.lang.container);
			container.appendChild(this.inputs.container);
			container.appendChild(this.presets.container);
		});

		// trigger initial refresh
		this.type.element.onchange();
	}

	toObject() {
		const result = {
			name: this.name.value,
			type: this.type.value,
			default: this.default.editor.state.doc.toString(),
		};
		switch (this.type.value) {
			case "boolean":
				break;
			case "number":
			case "vec2":
			case "vec3":
			case "vec4":
			case "mat2":
			case "mat3":
			case "mat4":
				result.min = this.min.element.value;
				result.max = this.max.element.value;
				result.step = this.step.element.value;
			case "string (single-line)":
			case "string (multi-line)":
				result.presets = this.presets.presets.map(preset => ({
					name: preset.name.value,
					value: preset.editor.state.doc.toString()
				}));
				break;
			default:
				break;
		}
		return result;
	}

}

class Presets {

	constructor() {
		this.presets = [];

		this.header = createElement("div", header => {
			header.appendChild(createElement("label", label => {
				label.innerText = "Presets";
			}));
			header.appendChild(createElement("button", button => {
				button.type = "button";
				button.innerText = "Add";
				button.onclick = _ => {
					const preset = new Preset();
					this.presets.push(preset);
					this.presetsContainer.appendChild(preset.container);
				};
			}));
		});

		this.presetsContainer = document.createElement("div");

		this.container = document.createElement("div");
		this.container.appendChild(this.header);
		this.container.appendChild(this.presetsContainer);
	}

}
class Preset {

	constructor(presets) {
		this.header = createElement("div", header => {
			header.appendChild(this.name = createElement("input", name => {
				name.type = "text";
			}));
			header.appendChild(createElement("button", button => {
				button.type = "button";
				button.innerText = "Delete";
				button.onclick = _ => {
					this.container.remove();
					const index = presets.presets.indexOf(this);
					if (index >= 0) {
						presets.presets.splice(index, 1);
					}
				};
			}));
		});

		this.container = document.createElement("div");
		this.container.appendChild(this.header);
		this.editor = new EditorView({
			parent: this.container,
			extensions: [basicSetup, javascript(), autocomplete_thin, githubDark]
		});
	}

}

const views = [];
const properties = [];

// create new view when add view button is clicked
document.getElementById("add_view").onclick = () => {
	const view = new View();
	views.push(view);
	document.getElementById("views").appendChild(view.container)
};

// create new property when add property button is clicked
document.getElementById("add_property").onclick = () => {
	const property = new Property();
	properties.push(property);
	document.getElementById("properties").appendChild(property.container)
};

// send save request to server when save button is clicked or ctrl+s is pressed
document.getElementById("save").onclick = async _ => {
	const tutorialObject = {
		name: document.getElementById("name").value,
		description: descriptionEditor.state.doc.toString(),
		views: views.map(view => view.toObject()),
		properties: properties.map(property => property.toObject())
	};
	const tutorialJson = json5.stringify(tutorialObject);

	const res = await fetch("/save", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: tutorialJson
	});
	console.log(res);
};
document.addEventListener("keydown", ev => {
	if (ev.ctrlKey && ev.key === "s") {
		document.getElementById("save").onclick();
		ev.preventDefault();
	}
});

// ---------- Helper Functions ---------- //

function createElement(type, onCreated = _ => { }) {
	const element = document.createElement(type);
	onCreated(element);
	return element;
}

class LabeledElement {

	constructor(labelText, type, initElement = _ => { }) {
		this.container = document.createElement("div");
		this.label = document.createElement("label");
		this.label.innerText = labelText;
		this.element = document.createElement(type);
		this.container.appendChild(this.label);
		this.container.appendChild(this.element);
		initElement(this.element);
	}

}

class LabeledEditor {

	constructor(labelText, configGenerator = parent => { return { parent: parent } }) {
		this.container = document.createElement("div");
		this.label = document.createElement("label");
		this.label.innerText = labelText;
		this.container.appendChild(this.label);
		this.editor = new EditorView(configGenerator(this.container));
	}

}

function addOption(select, value) {
	select.add(createElement("option", element => {
		element.value = value;
		element.innerText = value;
	}));
}
