const express = require('express');
const multer = require('multer');
const fs = require('fs');
const readline = require('readline');
const http_terminator = require('http-terminator');

const folder = process.argv.length >= 3 ? process.argv[2] : ".";
const port = process.argv.length >= 4 ? process.argv[3] : "25565";

// create and start server
console.log("Server starting...");
const app = express();
app.use(express.static(folder));
app.post('/api/endpoint', multer().none(), (req, res) => {
	const { body } = req;
	console.log({ body });
	res.send('Data received successfully');
	
	const tutorialDir = folder + "/tutorials/" + body.name;
	fs.mkdir(tutorialDir, (err, dir) => {
		if (err) {
			console.log(err);
			return;
		}

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
			fs.writeFileSync(tutorialDir + "/" + body["view_" + i + "_name"] + "_init.js", "(async function(gl) {\n" + body["view_" + i + "_init"] + "});\n", "utf8");
			fs.writeFileSync(tutorialDir + "/" + body["view_" + i + "_name"] + "_loop.js", "(function(gl, time, properties) {\n" + body["view_" + i + "_loop"] + "});\n", "utf8");
		}
		for (let i = 0; body["property_" + i + "_name"]; i++) {
			config.properties[i] = {
				id: body["property_" + i + "_name"],
				width: body["property_" + i + "_type"],
				height: body["property_" + i + "_defaultValue"]
			};
		}
		fs.writeFileSync(tutorialDir + "/config.json", JSON.stringify(config), "utf8");
	});
	
	console.log('Tutorial created successfully');
});
const server = app.listen(port);
console.log("Server started");

// stop server when "stop" is typed in command line
readline.createInterface({
	input: process.stdin,
	output: process.stbout
}).prependListener("line", async line => {
	if (line === "stop") {
		console.log("Server stopping...");
		await http_terminator.createHttpTerminator({ server }).terminate();
		console.log("Server stopped");
		process.exit();
	}
});
