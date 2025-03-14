const express = require('express');
const readline = require('readline');
const http_terminator = require('http-terminator');

const folder = process.argv.length >= 3 ? process.argv[2] : ".";
const port = process.argv.length >= 4 ? process.argv[3] : "25565";

// create and start server
console.log("Server starting...");
const app = express();
app.use(express.static(folder));
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
