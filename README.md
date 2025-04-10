## Render Tutorial Maker
Commands
- `npm run build` runs webpack to build the application
- `npm run dev` runs the server (`node server.js`). When the server is started use the `help` command to view a list of all available commands during runtime.

Configuration
- All server properties are specified through the `.env` file. Take a look at the `.env.example` file to view all available properties. At least the secret should be specified!

User Data
- User tutorials are saved in `tutorials/username/tutorialname/`
- Users are saved as username + password (hashed with bycrptjs) entries in `users.json`. When the value/password is empty then the user name is unlocked for registration.