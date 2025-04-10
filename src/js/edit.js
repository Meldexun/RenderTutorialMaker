import { EditorView, basicSetup } from "codemirror";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { autocomplete_js } from "./util/autocomplete_js";
import { githubDark } from '@uiw/codemirror-theme-github';

// create html editor for tutorial description
new EditorView({
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

			// create width input
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
		this.init = new LabeledEditor("Initialization Code", container => {
			return {
				parent: container,
				extensions: [basicSetup, javascript(), autocomplete_js, githubDark]
			}
		})

		// create render code editor
		this.loop = new LabeledEditor("Render Code", container => {
			return {
				parent: container,
				extensions: [basicSetup, javascript(), autocomplete_js, githubDark]
			}
		})

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

	constructor(id) {
		this.header = createElement("div", header => {
			header.className = "property-header";
			header.appendChild(createElement("input", element => {
				element.id = "property_" + id + "_name";
				element.name = "property_" + id + "_name";
				element.type = "text";
				element.value = "Unnamed Property";
			}));
			header.appendChild(createElement("button", button => {
				button.type = "button";
				button.textContent = "Delete";
				button.onclick = () => {
					this.container.remove();
				};
			}));
		});

		this.type = new LabeledElement("Type", "property_" + id + "_type", "select", type => {
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
			type.onchange = () => {
				switch (type.value) {
					case "boolean":
						this.defaultValue.element.value = false;
						this.inputOptions.replaceChildren(
							createCheckboxWithLabel("property_" + id + "_input_checkbox", "Checkbox", true)
						);
						break;
					case "number":
					case "vec2":
					case "vec3":
					case "vec4":
					case "mat2":
					case "mat3":
					case "mat4":
						switch (type.value) {
							case "number":
								this.defaultValue.element.value = 0;
								break;
							case "vec2":
								this.defaultValue.element.value = "vec2.create()";
								break;
							case "vec3":
								this.defaultValue.element.value = "vec3.create()";
								break;
							case "vec4":
								this.defaultValue.element.value = "vec4.create()";
								break;
							case "mat2":
								this.defaultValue.element.value = "mat2.create()";
								break;
							case "mat3":
								this.defaultValue.element.value = "mat3.create()";
								break;
							case "mat4":
								this.defaultValue.element.value = "mat4.create()";
								break;
						}
						this.inputOptions.replaceChildren(
							createLabelElementContainer("Min", "property_" + id + "_min", "property_" + id + "_min", "input", min => {
								min.type = "number";
								min.parentNode.className = "input-oneline";
							}),
							createLabelElementContainer("Max", "property_" + id + "_max", "property_" + id + "_max", "input", max => {
								max.type = "number";
								max.parentNode.className = "input-oneline";
							}),
							createCheckboxWithLabel("property_" + id + "_input_number", "Number", true)
						);
						if (type.value === "number") {
							this.inputOptions.appendChild(createCheckboxWithLabel("slider", "Slider"));
						}
						break;
					case "string (single-line)":
						this.defaultValue.element.value = "";
						this.inputOptions.replaceChildren(
							createLabelElementContainer("Language", "property_" + id + "_language", "property_" + id + "_language", "select", language => {
								language.parentNode.className = "input-oneline";
								addOption(language, "Plain-Text");
								addOption(language, "JavaScript");
								addOption(language, "GLSL");
							}),
							createCheckboxWithLabel("property_" + id + "_input_text", "Text", true)
						);
						break;
					case "string (multi-line)":
						this.defaultValue.element.value = "";
						this.inputOptions.replaceChildren(
							createLabelElementContainer("Language", "property_" + id + "_language", "property_" + id + "_language", "select", language => {
								language.parentNode.className = "input-oneline";
								addOption(language, "Plain-Text");
								addOption(language, "JavaScript");
							}),
							createCheckboxWithLabel("property_" + id + "_input_textarea", "Text Area", true)
						);
						break;
					default:
						break;
				}
				// add preset option if type is not boolean
				if (type.value !== "boolean") {
					this.inputOptions.appendChild(createElement("div", c => {
						c.className = "input-oneline presets-input";
						c.appendChild(createElement("div", c1 => {
							c1.appendChild(createElement("input", checkbox => {
								checkbox.type = "checkbox";
								checkbox.id = "property_" + id + "_presets";
								checkbox.name = "property_" + id + "_presets"
								checkbox.onchange = () => {
									for (let child = c1.nextSibling; child !== null; child = child.nextSibling) {
										child.querySelectorAll("input, button").forEach(element => {
											element.disabled = !checkbox.checked;
										});
									}
								};
							}));
							c1.appendChild(createElement("label", label => {
								label.textContent = "Presets";
							}));
						}));
						c.appendChild(createElement("div", presets => {
							presets.appendChild(createElement("button", button => {
								button.type = "button";
								button.textContent = "Add Preset";
								button.onclick = () => {
									button.parentNode.insertBefore(createElement("div", preset => {
										preset.appendChild(createElement("input", input => {
											input.type = "text";
											input.id = "property_" + id + "_preset_" + (button.parentNode.children.length - 1);
											input.name = "property_" + id + "_preset_" + (button.parentNode.children.length - 1);
										}));
										preset.appendChild(createElement("button", button => {
											button.type = "button";
											button.textContent = "Delete";
											button.onclick = () => {
												preset.remove();
											};
										}));
									}), button);
								};
							}));
						}));
					}));
				}
			};
		});
		this.type.container.className = "input-oneline";

		this.defaultValue = new LabeledElement("Default Value", "property_" + id + "_defaultValue", "input", defaultValue => {
			defaultValue.type = "text";
			defaultValue.value = "";
		});
		this.defaultValue.container.className = "input-oneline";

		this.inputOptions = document.createElement("div");
		this.inputOptions.className = "input-multiline";

		this.container = createElement("div", container => {
			container.className = "property";
			container.appendChild(this.header);
			container.appendChild(this.type.container);
			container.appendChild(this.defaultValue.container);
			container.appendChild(this.inputOptions);
		});

		this.type.element.onchange();
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
	console.log(views.map(view => view.toObject()));
	const formData = new FormData(document.getElementById("form"));
	console.log("Sending data...");
	console.log(formData);
	await fetch('/save', { method: "POST", body: formData });
	console.log("Data sent")
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

function createLabelElementContainer(labelText, type, initElement = _ => { }, initLabel = _ => { }) {
	const container = document.createElement("div");

	const label = document.createElement("label");
	label.innerText = labelText;
	container.appendChild(label);

	const element = document.createElement(type);
	container.appendChild(element);

	initElement(element);
	initLabel(label);

	return container;
}

function createCheckboxWithLabel(labelText, checked = false, disabled = false) {
	return createElement("div", container => {
		container.appendChild(createElement("input", input => {
			input.type = "checkbox";
			input.checked = checked;
			input.disabled = disabled;
		}))
		container.appendChild(createElement("label", label => {
			label.innerText = labelText;
		}))
	})
}

function addOption(select, value) {
	select.add(createElement("option", element => {
		element.value = value;
		element.innerText = value;
	}));
}
