const bcryptjs = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const http_terminator = require('http-terminator');
const multer = require('multer');
const path = require('path');
const readline = require('readline');

{
	const result = require('dotenv').config();
	if (result.error) {
		console.log("Failed to load .env file. Falling back to default values. Session data is NOT protected. If this is a production environment make sure to create a valid .env file.")
		console.log(result.error);
	} else {
		if (!result.parsed.secret) {
			console.log("No secret specified in .env file. Falling back to default value. Session data is NOT protected. If this is a production environment make sure to create a valid .env file.")
		}
		if (!result.parsed.port) {
			console.log("No port specified in .env file. Falling back to default value.")
		}
	}
}

console.log("Server starting...");
// create server
const app = express();

// setup express-session and ejs needed for login system
app.set("view engine", "ejs");
app.set("views", "dist/html");
app.use(session({
	secret: process.env.secret || "secret",
	resave: false,
	saveUninitialized: true
}));

// make user data available
app.use(express.static("userdata"));

// make default asset files available
app.use(express.static("dist"));

// make pages available
function render(req, res, view) {
	const options = {
		user: req.session.user || null,
		error: req.session.error || null
	};
	res.render(view, options);
	delete req.session.error;
}
app.get("/", (req, res) => render(req, res, "index.ejs"));
app.get("/view", (req, res) => render(req, res, "view.ejs"));
app.get("/edit", (req, res) => render(req, res, "edit.ejs"));
app.get("/profile", (req, res) => render(req, res, "profile.ejs"));

// handle register/login/logout requests
const userDataFile = path.join(__dirname, "users.json");
let users = fs.existsSync(userDataFile) ? JSON.parse(fs.readFileSync(userDataFile)) : {};
function saveUsers(modified) {
	if (users !== modified) {
		fs.mkdirSync(path.dirname(userDataFile), { recursive: true });
		fs.writeFileSync(userDataFile, JSON.stringify(modified));
		users = modified;
	}
}
function userRegistered(user) {
	return users[user];
}
function userUnlocked(user) {
	return users[user] === "";
}
function passwordMatches(user, password) {
	return bcryptjs.compareSync(password, users[user]);
}
function registerUser(user, password) {
	const hash = bcryptjs.hashSync(password);
	if (users[user] !== hash) {
		const modified = { ...users };
		modified[user] = hash;
		saveUsers(modified);
	}
}
function resetUser(user) {
	if (users[user] !== "") {
		const modified = { ...users };
		modified[user] = "";
		saveUsers(modified);
	}
}
function deleteUser(user) {
	if (user in users) {
		const modified = { ...users };
		delete modified[user];
		saveUsers(modified);
	}
}

app.post("/register", express.urlencoded({ extended: false }), (req, res) => {
	const { user, password } = req.body;
	console.log(`User "${user}" registering`);

	if (userRegistered(user)) {
		console.log(req.session.error = `User "${user}" already registered`);
		return res.redirect(req.headers.referer);
	}
	if (!userUnlocked(user)) {
		console.log(req.session.error = `User "${user}" not unlocked for registration`);
		return res.redirect(req.headers.referer);
	}

	try {
		registerUser(user, password);
	} catch (err) {
		console.log(`Failed registering user "${user}"`);
		console.log(err);
		req.session.error = "An error occurred during registration. Please try again or ask an administrator for help."
		return res.redirect(req.headers.referer);
	}
	console.log(`User "${user}" registered successfully`);

	// login user
	req.session.regenerate(err => {
		if (err) next(err);

		req.session.user = user;

		req.session.save(err => {
			if (err) next(err);

			console.log(`User "${user}" logged in successfully`);
			res.redirect(req.headers.referer);
		});
	});
});
app.post("/login", express.urlencoded({ extended: false }), (req, res) => {
	const { user, password } = req.body;
	console.log(`User "${user}" logging in`);

	if (!userRegistered(user)) {
		console.log(`User "${user}" not registered`);
		req.session.error = "Invalid username";
		return res.redirect(req.headers.referer);
	}
	if (!passwordMatches(user, password)) {
		// password wrong
		console.log(`User "${user}" tried to log in with wrong password`);
		req.session.error = "Invalid password";
		return res.redirect(req.headers.referer);
	}

	// login user
	req.session.regenerate(err => {
		if (err) next(err);

		req.session.user = user;

		req.session.save(err => {
			if (err) next(err);

			console.log(`User "${user}" logged in successfully`);
			res.redirect(req.headers.referer);
		});
	});
});
app.post("/logout", (req, res) => {
	const user = req.session.user;
	console.log(`User "${user}" logging out`);

	// logout user
	req.session.destroy(err => {
		if (err) next(err);

		console.log(`User "${user}" logged out successfully`);
		res.redirect(req.headers.referer);
	});
});

// handle tutorial save requests
app.post("/save", multer().none(), (req, res) => {
	const user = req.session.user;
	console.log(`Processing save request from user "${user}"`);
	if (!user) {
		console.log(`Ignore save request because user is not logged in`);
		return res.status(401).send("Log in required");
	}

	const { body } = req;

	// save tutorial in temp folder
	const temp = path.join(__dirname, "temp", user, body.name);
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
				default: body["property_" + i + "_defaultValue"]
			};
			switch (body["property_" + i + "_type"]) {
				case "boolean":
					if (body["property_" + i + "_input_checkbox"] === "on") {
						config.properties[i]["input_checkbox"] = true;
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

		// everything saved successfully into temp folder -> move into target tutorial folder
		const target = path.join(__dirname, "userdata", "tutorials", user, body.name);
		if (fs.existsSync(target)) {
			fs.rmSync(target, { recursive: true });
		}
		fs.renameSync(temp, target);

		res.send("Tutorial saved successfully!");
	} catch (err) {
		// delete temp files silently
		try {
			if (fs.existsSync(temp)) {
				fs.rmSync(temp, { recursive: true });
			}
		} catch (err) {
			// ignore
		}

		console.log("An error occurred while processing tutorial save request. Please try again or ask an administrator for help.");
		console.log(err);
		res.send("Failed saving tutorial!");
	}
});

// start server listening on given port
const server = app.listen(process.env.port || 25565);
console.log("Server started");

// process commandline inputs
readline.createInterface({
	input: process.stdin,
	output: process.stbout
}).prependListener("line", async line => {
	if (line === "") {
		return;
	}
	const args = line.split(" ");
	switch (args[0]) {
		case "help":
			console.log("help - Prints a list of all available commands");
			console.log("stop - Stops the server");
			return;
		case "stop":
			console.log("Server stopping...");
			await http_terminator.createHttpTerminator({ server }).terminate();
			console.log("Server stopped");
			process.exit();
		default:
			console.log("Unknown command. Type \"help\" to get a list of all available commands.")
			return;
	}
});
