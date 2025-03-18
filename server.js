const express = require('express');
const multer = require('multer');
const fs = require('fs');
const readline = require('readline');
const http_terminator = require('http-terminator');

const folder = process.argv.length >= 3 ? process.argv[2] : ".";
const port = process.argv.length >= 4 ? process.argv[3] : "25565";

console.log("Server starting...");
// create server
const app = express();
// use given folder as src
app.use(express.static(folder));
// process tutorial save requests
app.post('/api/endpoint', multer().none(), (req, res) => {
	const { body } = req;
	console.log({ body });

	// save tutorial
	const temp = folder + "/temp/" + body.name;
	try {
		// delete existing
		if (fs.existsSync(temp)) {
			fs.rmSync(temp, { recursive: true });
		}

		// create directory
		fs.mkdirSync(temp, { recursive: true });

		// save tutorial files into temp folder
		const config = {
			title: body.name,
			views: [],
			properties: []
		};
		for (let i = 0; body["view_" + i + "_name"]; i++) {
			config.views[i] = {
				id: body["view_" + i + "_name"],
				width: body["view_" + i + "_width"],
				height: body["view_" + i + "_height"]
			};
			fs.writeFileSync(temp + "/" + body["view_" + i + "_name"] + "_init.js", "(async function(gl) {\n" + body["view_" + i + "_init"] + "\n});\n", "utf8");
			fs.writeFileSync(temp + "/" + body["view_" + i + "_name"] + "_loop.js", "(function(gl, time, properties) {\n" + body["view_" + i + "_loop"] + "\n});\n", "utf8");
		}
		for (let i = 0; body["property_" + i + "_name"]; i++) {
			config.properties[i] = {
				id: body["property_" + i + "_name"],
				type: body["property_" + i + "_type"],
				defaultValue: body["property_" + i + "_defaultValue"]
			};
			switch (body["property_" + i + "_type"]) {
				case "boolean":
					if (body["property_" + i + "_input_checkBox"] === "on") {
						config.properties[i]["input_checkBox"] = true;
					}
					break;
				case "number":
				case "vec2":
				case "vec3":
				case "vec4":
				case "mat2":
				case "mat3":
				case "mat4":
					if (body["property_" + i + "_min"] && body["property_" + i + "_min"] !== "") {
						config.properties[i]["min"] = body["property_" + i + "_min"];
					}
					if (body["property_" + i + "_max"] && body["property_" + i + "_max"] !== "") {
						config.properties[i]["max"] = body["property_" + i + "_max"];
					}
					if (body["property_" + i + "_input_number"] === "on") {
						config.properties[i]["input_number"] = true;
					}
					if (body["property_" + i + "_type"] === "number" && body["property_" + i + "_input_slider"] === "on") {
						config.properties[i]["input_slider"] = true;
					}
					break;
				case "string (single-line)":
				case "string (multi-line)":
					config.properties[i]["language"] = body["property_" + i + "_language"];
					if (body["property_" + i + "_type"] === "string (single-line)" && body["property_" + i + "_input_text"] === "on") {
						config.properties[i]["input_text"] = true;
					}
					if (body["property_" + i + "_type"] === "string (multi-line)" && body["property_" + i + "_input_textarea"] === "on") {
						config.properties[i]["input_textarea"] = true;
					}
					break;
				default:
					throw new Error("Invalid property type '" + body["property_" + i + "_type"] + "'");
			}
			if (body["property_" + i + "_input_presets"] === "on") {
				config.properties[i]["input_presets"] = true;
				config.properties[i]["presets"] = [];
				for (let j = 0; body["property_" + i + "_preset_" + j]; j++) {
					config.properties[i]["presets"][j] = body["property_" + i + "_preset_" + j];
				}
			}
		}
		fs.writeFileSync(temp + "/config.json", JSON.stringify(config, null, 2), "utf8");

		// everything saved successfully into temp folder -> move into tutorial folder
		const target = folder + "/tutorials/" + body.name;
		if (fs.existsSync(target)) {
			fs.rmSync(target, { recursive: true });
		}
		fs.renameSync(temp, target);

		res.send('Tutorial saved successfully!');
	} catch (err) {
		// delete temp files
		if (fs.existsSync(temp)) {
			fs.rmSync(temp, { recursive: true });
		}

		console.log(err);
		res.send('Failed saving tutorial!');
	}
});
// start server listening on given port
const server = app.listen(port);
console.log("Server started");

// process commandline inputs
readline.createInterface({
	input: process.stdin,
	output: process.stbout
}).prependListener("line", async line => {
	// stop server when "stop" is typed in command line
	if (line === "stop") {
		console.log("Server stopping...");
		await http_terminator.createHttpTerminator({ server }).terminate();
		console.log("Server stopped");
		process.exit();
	}
});
