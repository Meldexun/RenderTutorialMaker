const bcryptjs = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const http_terminator = require('http-terminator');
const json5 = require('json5');
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
app.get("/edit", (req, res) => {
	if (!req.session.user) {
		res.redirect("/login_required?redirect=edit" + (req.query.id ? "?id=" + req.query.id : ""));
	} else {
		render(req, res, "edit.ejs");
	}
});
app.get("/profile", (req, res) => {
	if (!req.session.user) {
		res.redirect("/login_required?redirect=profile");
	} else {
		render(req, res, "profile.ejs");
	}
});
app.get("/credits", (req, res) => render(req, res, "credits.ejs"));
app.get("/documentation", (req, res) => render(req, res, "documentation.ejs"));
app.get("/login_required", (req, res) => {
	if (req.session.user) {
		res.redirect(req.query.redirect || "/");
	} else {
		render(req, res, "login_required.ejs");
	}
});
app.get("/user_tutorials", (req, res) => {
	try {
		const dir = path.join(__dirname, "userdata", "tutorials");
		const tutorials = fs.readdirSync(dir)
			.filter(p => fs.lstatSync(path.join(dir, p)).isDirectory())
			.flatMap(p => fs.readdirSync(path.join(dir, p)).map(p1 => p + "/" + p1))
			.filter(p => fs.lstatSync(path.join(dir, p)).isDirectory());
		res.send(JSON.stringify(tutorials));
	} catch (err) {
		res.send(JSON.stringify([]));
	}
});
app.get("/tutorials", express.text(), (req, res) => {
	try {
		if (req.session.user) {
			const dir = path.join(__dirname, "userdata", "tutorials", req.session.user);
			const tutorials = fs.readdirSync(dir)
				.filter(p => fs.lstatSync(path.join(dir, p)).isDirectory());
			res.send(JSON.stringify({ user: req.session.user, tutorials: tutorials }));
		} else {
			res.send(JSON.stringify({ user: null, tutorials: [] }));
		}
	} catch (err) {
		res.send(JSON.stringify({ user: null, tutorials: [] }));
	}
});

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
function unlockUser(user) {
	if (!users[user] && users[user] !== "") {
		const modified = { ...users };
		modified[user] = "";
		saveUsers(modified);
	}
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
	if (users[user]) {
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

	if (!user) {
		console.log(req.session.error = `User is missing`);
		return res.redirect(req.headers.referer || "/");
	}
	if (user.length > 100) {
		console.log(req.session.error = `User "${user}" is too long (maximum is 100 characters)`);
		return res.redirect(req.headers.referer || "/");
	}
	if (userRegistered(user)) {
		console.log(req.session.error = `User "${user}" already registered`);
		return res.redirect(req.headers.referer || "/");
	}
	if (!userUnlocked(user)) {
		console.log(req.session.error = `User "${user}" not unlocked for registration`);
		return res.redirect(req.headers.referer || "/");
	}
	if (!password) {
		console.log(req.session.error = `Password is missing`);
		return res.redirect(req.headers.referer || "/");
	}
	if (bcryptjs.truncates(password)) {
		console.log(req.session.error = `Password is too long`);
		return res.redirect(req.headers.referer || "/");
	}

	try {
		registerUser(user, password);
	} catch (err) {
		console.log(`Failed registering user "${user}"`);
		console.log(err);
		req.session.error = "An error occurred during registration. Please try again or ask an administrator for help."
		return res.redirect(req.headers.referer || "/");
	}
	console.log(`User "${user}" registered successfully`);

	// login user
	req.session.regenerate(err => {
		if (err) next(err);

		req.session.user = user;

		req.session.save(err => {
			if (err) next(err);

			console.log(`User "${user}" logged in successfully`);
			if (req.headers.referer) {
				const url = new URL(req.headers.referer);
				if (url.pathname === "/login_required") {
					res.redirect(url.searchParams.get("redirect") || "/");
				} else {
					res.redirect(req.headers.referer);
				}
			} else {
				res.redirect("/");
			}
		});
	});
});
app.post("/login", express.urlencoded({ extended: false }), (req, res) => {
	const { user, password } = req.body;
	console.log(`User "${user}" logging in`);

	if (!userRegistered(user)) {
		console.log(`User "${user}" not registered`);
		req.session.error = "Invalid username";
		return res.redirect(req.headers.referer || "/");
	}
	if (!passwordMatches(user, password)) {
		// password wrong
		console.log(`User "${user}" tried to log in with wrong password`);
		req.session.error = "Invalid password";
		return res.redirect(req.headers.referer || "/");
	}

	// login user
	req.session.regenerate(err => {
		if (err) next(err);

		req.session.user = user;

		req.session.save(err => {
			if (err) next(err);

			console.log(`User "${user}" logged in successfully`);
			if (req.headers.referer) {
				const url = new URL(req.headers.referer);
				if (url.pathname === "/login_required") {
					res.redirect(url.searchParams.get("redirect") || "/");
				} else {
					res.redirect(req.headers.referer);
				}
			} else {
				res.redirect("/");
			}
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
		res.redirect(req.headers.referer || "/");
	});
});

// handle tutorial save requests
app.post("/save", express.text(), (req, res) => {
	const user = req.session.user;
	console.log(`Processing save request from user "${user}"`);
	if (!user) {
		console.log(`Ignore save request because user is not logged in`);
		return res.status(401).send("Log in required");
	}

	let config = {
		name: null,
		description: null,
		views: [
			{
				name: null,
				width: null,
				height: null,
				init: null,
				loop: null
			}
		],
		properties: [
			{
				name: null,
				type: null,
				default: null,
				min: null,
				max: null,
				step: null,
				language: null,
				input_checkbox: null,
				input_number: null,
				input_slider: null,
				input_text: null,
				input_textarea: null,
				presets: [
					{
						name: null,
						value: null
					}
				]
			}
		]
	};
	try {
		config = json5.parse(req.body);
	} catch (err) {
		console.log("Failed parsing tutorial as json5!");
		console.log(err);
		return res.status(400).send("Tutorial not in json5 format!");
	}

	// validate tutorial json
	function allDefined(a) {
		return !a.some(a => !a.name);
	}
	function firstDuplicate(a) {
		const set = new Set();
		for (e of a) {
			if (set.has(e.name)) {
				return e.name;
			}
			set.add(e.name);
		}
		return null;
	}
	let duplicate;
	if (!config.name) {
		console.log("Tutorial is missing name!");
		return res.status(400).send("Tutorial is missing name!");
	}
	// check view names
	if (!allDefined(config.views)) {
		console.log("View is missing name!");
		return res.status(400).send("View is missing name!");
	}
	if (duplicate = firstDuplicate(config.views)) {
		console.log(`Duplicate view name "${duplicate}"!`);
		return res.status(400).send(`Duplicate view name "${duplicate}"!`);
	}
	// check property names
	if (!allDefined(config.properties)) {
		console.log("Property is missing name!");
		return res.status(400).send("Property is missing name!");
	}
	if (duplicate = firstDuplicate(config.properties)) {
		console.log(`Duplicate property name "${duplicate}"!`);
		return res.status(400).send(`Duplicate property name "${duplicate}"!`);
	}
	// check preset names
	if (!allDefined(config.properties.flatMap(property => property.presets || []))) {
		console.log("Preset is missing name!");
		return res.status(400).send("Preset is missing name!");
	}

	// save tutorial in temp folder
	const temp = path.join(__dirname, "temp", user, config.name);
	try {
		// delete existing
		if (fs.existsSync(temp)) {
			fs.rmSync(temp, { recursive: true });
		}

		// create directory
		fs.mkdirSync(temp, { recursive: true });

		// save tutorial files into temp folder
		config.views.forEach(view => {
			fs.writeFileSync(path.join(temp, view.name + "_init.js"), "(async function(gl) {\n" + (view.init || "") + "\n});\n", "utf8");
			fs.writeFileSync(path.join(temp, view.name + "_loop.js"), "(function(gl, time) {\n" + (view.loop || "") + "\n});\n", "utf8");
			delete view.init;
			delete view.loop;
		});
		fs.writeFileSync(temp + "/config.json", json5.stringify(config, null, "\t"), "utf8");

		// everything saved successfully into temp folder -> move into target tutorial folder
		const target = path.join(__dirname, "userdata", "tutorials", user, config.name);
		fs.mkdirSync(target, { recursive: true });
		if (fs.existsSync(target)) {
			fs.rmSync(target, { recursive: true });
		}
		fs.renameSync(temp, target);

		console.log(`Saved tutorial "${user + "/" + config.name}" successfully.`)
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

		console.log("An unknown error occurred while processing tutorial save request!");
		console.log(err);
		res.status(500).send("Server failed saving tutorial. Please try again or ask an administrator for help.");
	}
});
// handle tutorial delete requests
app.post("/delete", express.text(), (req, res) => {
	const user = req.session.user;
	console.log(`Processing delete request from user "${user}"`);
	if (!user) {
		console.log(`Ignore delete request because user is not logged in`);
		return res.status(401).send("Log in required");
	}

	const tutorial = path.join(__dirname, "userdata", "tutorials", user, req.body);
	try {
		if (!fs.existsSync(tutorial)) {
			console.log(`Tutorial "${user + "/" + req.body}" does not exist.`);
			return res.status(400).send("Tutorial does not exist!");
		}
		fs.rmSync(tutorial, { recursive: true });

		console.log(`Deleted tutorial "${user + "/" + req.body}" successfully.`)
		res.send("Tutorial deleted successfully!");
	} catch (err) {
		console.log("An unknown error occurred while processing tutorial delete request!");
		console.log(err);
		res.status(500).send("Server failed deleting tutorial. Please try again or ask an administrator for help.");
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
			console.log("add_user [user] - Unlock the specified username for registration. The first user that makes a registration request with this username will create a new account.");
			console.log("reset_user [user] - Reset the password of the specified user. Unlocks the specified username for registration. The user will have to register again.");
			console.log("delete_user [user] - Delete the specified user and all their tutorials");
			console.log("delete_tutorial [user] [tutorial] - Delete the specified tutorial of the specified user");
			console.log("delete_tutorials [user] - Delete all tutorials of the specified user");
			return;
		case "stop":
			console.log("Server stopping...");
			await http_terminator.createHttpTerminator({ server }).terminate();
			console.log("Server stopped");
			process.exit();
		case "add_user":
			if (args.length < 2) {
				console.log("Not enough arguments");
			}
			if (userUnlocked(args[1]) || userRegistered(args[1])) {
				return console.log("User exists already");
			}
			try {
				unlockUser(args[1]);
				console.log("Added user successfully");
			} catch (err) {
				console.log("Failed executing command!");
				console.log(err);
			}
			return;
		case "reset_user":
			if (args.length < 2) {
				console.log("Not enough arguments");
			}
			if (!userRegistered(args[1])) {
				return console.log("User not registered");
			}
			try {
				resetUser(args[1]);
				console.log("Reseted user successfully");
			} catch (err) {
				console.log("Failed executing command!");
				console.log(err);
			}
			return;
		case "delete_user":
			if (args.length < 2) {
				console.log("Not enough arguments");
			}
			if (!userRegistered(args[1])) {
				return console.log("User not registered");
			}
			try {
				deleteUser(args[1]);
				fs.rmSync(path.join(__dirname, "userdata", "tutorials", args[1]), { recursive: true });
				console.log("Deleted user successfully");
			} catch (err) {
				console.log("Failed executing command!");
				console.log(err);
			}
			return;
		case "delete_tutorial":
			if (args.length < 3) {
				console.log("Not enough arguments");
			}
			try {
				if (!fs.existsSync(path.join(__dirname, "userdata", "tutorials", args[1], args[2]))) {
					return console.log("Tutorial does not exist");
				}
				fs.rmSync(path.join(__dirname, "userdata", "tutorials", args[1], args[2]), { recursive: true });
				console.log("Tutorial deleted successfully");
			} catch (err) {
				console.log("Failed executing command!");
				console.log(err);
			}
			return;
		case "delete_tutorials":
			if (args.length < 2) {
				console.log("Not enough arguments");
			}
			try {
				if (!fs.existsSync(path.join(__dirname, "userdata", "tutorials", args[1]))) {
					return console.log("User has no tutorials");
				}
				fs.rmSync(path.join(__dirname, "userdata", "tutorials", args[1]), { recursive: true });
				console.log("Tutorials deleted successfully");
			} catch (err) {
				console.log("Failed executing command!");
				console.log(err);
			}
			return;
		default:
			console.log("Unknown command. Type \"help\" to get a list of all available commands.")
			return;
	}
});
