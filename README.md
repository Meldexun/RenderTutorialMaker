## Render Tutorial Maker
Prerequisites
- Install npm [https://docs.npmjs.com/downloading-and-installing-node-js-and-npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Commands
- `npm i` installs all required dependencies
- `npm run build` runs webpack to build the application
- `npm run dev` runs the server (`node server.js`). When the server is started, use the `help` command to view a list of all available commands during runtime.

Configuration
- All server properties are specified through the `.env` file. Take a look at the `.env.example` file to view all available properties. At least the [session](https://www.npmjs.com/package/express-session) secret should be specified!

User Data
- User tutorials are saved in `./userdata/tutorials/USER_NAME/TUTORIAL_NAME/`
- Users are saved as username + password (hashed with [bycrptjs](https://www.npmjs.com/package/bcryptjs)) entries in `users.json`. When the value/password is empty, then that user name is unlocked for registration.
