const { EditorView, basicSetup } = require("codemirror");
const { javascript } = require("@codemirror/lang-javascript");

class View {

	constructor(id) {
		this.header = createElement("div", header => {
			header.className = "view-header";
			header.appendChild(createElement("input", element => {
				element.id = "view_" + id + "_name";
				element.name = "view_" + id + "_name";
				element.type = "text";
				element.value = "Unnamed View";
			}));
			header.appendChild(createElement("div", buttons => {
				buttons.className = "buttons";
				buttons.appendChild(createElement("button", button => {
					button.type = "button";
					button.textContent = "Load Preset";
					button.onclick = () => {
						this.presetDialog.showModal();
					};
				}));
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
					};
				}));
			}));
		});
		this.main = createElement("div", main => {
			main.className = "view-main";
		});

		this.width = new LabeledInput("Width", "view_" + id + "_width", "input", width => {
			width.type = "number";
			width.value = 600;
		});
		this.width.container.className = "input-oneline";

		this.height = new LabeledInput("Height", "view_" + id + "_height", "input", height => {
			height.type = "number";
			height.value = 400;
		});
		this.height.container.className = "input-oneline";

		this.init = new LabeledInput("Init", "view_" + id + "_init", "textarea", init => {
			init.hidden = true;
		});
		this.init.container.className = "input-multiline";
		this.initEditor = new EditorView({
			parent: this.init.container,
			extensions: [basicSetup, javascript()],
			doc: "..."
		});

		this.loop = new LabeledInput("Loop", "view_" + id + "_loop", "textarea", loop => {
			loop.hidden = true;
		});
		this.loop.container.className = "input-multiline";
		this.loopEditor = new EditorView({
			parent: this.loop.container,
			extensions: [basicSetup, javascript()],
			doc: "..."
		});

		this.presetDialog = createElement("dialog", dialog => {
			const selection = createElement("select", select => {
				addOption(select, "Preset 1");
				addOption(select, "Preset 2");
			});
			dialog.appendChild(selection);
			dialog.appendChild(createElement("button", button => {
				button.type = "button";
				button.textContent = "Load";
				button.onclick = () => {
					this.init.input.value = selection.value;
					this.loop.input.value = selection.value;
					dialog.close();
				};
			}));
			dialog.appendChild(createElement("button", button => {
				button.type = "button";
				button.textContent = "Cancel";
				button.onclick = () => {
					dialog.close();
				};
			}));
		});
		this.container = createElement("div", container => {
			container.className = "view";
			container.appendChild(this.header);
			container.appendChild(this.main);
			this.main.appendChild(this.width.container);
			this.main.appendChild(this.height.container);
			this.main.appendChild(this.init.container);
			this.main.appendChild(this.loop.container);
			container.appendChild(this.presetDialog);
		});
	}

	toObject() {
		const obj = new Object();
		obj.name = this.name.input.value;
		obj.width = this.width.input.value;
		obj.height = this.height.input.value;
		obj.type = this.type.input.value;
		for (const attribute of this.attributes) {
			obj[attribute.input.id] = attribute.input.value;
		}
		return obj;
	}

}

class LabeledInput {

	constructor(labelText, id, inputType, initInput = _ => { }) {
		this.label = createElement("label", label => {
			label.for = id;
			label.innerText = labelText;
		});
		this.input = createElement(inputType, input => {
			input.id = id;
			input.name = id;
			initInput(input);
		});
		this.container = createElement("div", container => {
			container.appendChild(this.label);
			container.appendChild(this.input);
		});
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

		this.type = new LabeledInput("Type", "property_" + id + "_type", "select", type => {
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
						this.defaultValue.input.value = false;
						this.inputOptions.replaceChildren(
							createInputOption("property_" + id + "_input_checkbox", "Checkbox", true)
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
								this.defaultValue.input.value = 0;
								break;
							case "vec2":
								this.defaultValue.input.value = "vec2.create()";
								break;
							case "vec3":
								this.defaultValue.input.value = "vec3.create()";
								break;
							case "vec4":
								this.defaultValue.input.value = "vec4.create()";
								break;
							case "mat2":
								this.defaultValue.input.value = "mat2.create()";
								break;
							case "mat3":
								this.defaultValue.input.value = "mat3.create()";
								break;
							case "mat4":
								this.defaultValue.input.value = "mat4.create()";
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
							createInputOption("property_" + id + "_input_number", "Number", true)
						);
						if (type.value === "number") {
							this.inputOptions.appendChild(createInputOption("slider", "Slider"));
						}
						break;
					case "string (single-line)":
						this.defaultValue.input.value = "";
						this.inputOptions.replaceChildren(
							createLabelElementContainer("Language", "property_" + id + "_language", "property_" + id + "_language", "select", language => {
								language.parentNode.className = "input-oneline";
								addOption(language, "Plain-Text");
								addOption(language, "JavaScript");
								addOption(language, "GLSL");
							}),
							createInputOption("property_" + id + "_input_text", "Text", true)
						);
						break;
					case "string (multi-line)":
						this.defaultValue.input.value = "";
						this.inputOptions.replaceChildren(
							createLabelElementContainer("Language", "property_" + id + "_language", "property_" + id + "_language", "select", language => {
								language.parentNode.className = "input-oneline";
								addOption(language, "Plain-Text");
								addOption(language, "JavaScript");
								addOption(language, "GLSL");
							}),
							createInputOption("property_" + id + "_input_textarea", "Text Area", true)
						);
						break;
					default:
						break;
				}
				if (type.value !== "boolean") {
					this.inputOptions.appendChild(createElement("div", c => {
						c.className = "input-oneline presets-input";
						c.appendChild(createElement("div", c1 => {
							c1.appendChild(createElement("input", checkbox => {
								checkbox.type = "checkbox";
								checkbox.id = "presets";
								checkbox.name = "presets"
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

		this.defaultValue = new LabeledInput("Default Value", "property_" + id + "_defaultValue", "input", defaultValue => {
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

		this.type.input.onchange();
	}

}

const views = [];
const properties = [];

document.getElementById("add_view").onclick = () => {
	const view = new View(views.length);
	views.push(view);
	document.getElementById("views").appendChild(view.container);
};

document.getElementById("add_property").onclick = () => {
	const property = new Property(properties.length);
	properties.push(property);
	document.getElementById("properties").appendChild(property.container);
};

document.getElementById("save").onclick = async () => {
	for (let view of views) {
		console.log(view);
		view.init.input.value = view.initEditor.state.doc;
		view.loop.input.value = view.loopEditor.state.doc;
	}

	const formData = new FormData(document.getElementById("form"));
	console.log("Sending data...");
	console.log(formData);
	await fetch('/api/endpoint', { method: "POST", body: formData });
	console.log("Data sent")
};

// ---------- Helper Functions ---------- //

function createElement(type, onCreated = _ => { }) {
	const element = document.createElement(type);
	onCreated(element);
	return element;
}

function createLabelElementContainer(labelText, id, name, type, initElement = _ => { }) {
	const container = document.createElement("div");

	const label = document.createElement("label");
	label.for = id;
	label.innerText = labelText;
	container.appendChild(label);

	const element = document.createElement(type);
	element.id = id;
	element.name = name;
	container.appendChild(element);

	initElement(element);

	return container;
}

function createElementLabelContainer(parent, labelText, tagName, id, name, initElement = _ => { }) {
	const container = document.createElement("div");

	const element = document.createElement(type);
	element.id = id;
	element.name = name;
	container.appendChild(element);

	const label = document.createElement("label");
	label.for = id;
	label.innerText = labelText;
	container.appendChild(label);

	initElement(element);

	return container;
}

function createInputOption(id, text, checked = false, disabled = false) {
	return createElement("div", container => {
		container.appendChild(createElement("input", input => {
			input.id = id;
			input.name = id;
			input.type = "checkbox";
			input.checked = checked;
			input.disabled = disabled;
		}))
		container.appendChild(createElement("label", label => {
			label.for = id;
			label.innerText = text;
		}))
	})
}

function addOption(select, value) {
	select.add(createElement("option", element => {
		element.value = value;
		element.innerText = value;
	}));
}
