# flippz
Othello's time has come; introducing Flippz. A refreshed online multiplayer experience for a game that never gets old.

This is a small 4 week project for Delft University of Technology's Web and Database technology classes.

## Installation
First of all, make sure you're using **npm v14 or higher.** 

### Download
You can either download the code directly as a ZIP file [here][GitHub ZIP link], or use the command below:
 ```
git clone https://github.com/Mitchell3514/flippz.git
 ```
### Starting the server
To optimize transfer speed, the source code first has to be built.
You can automatically build and run the server through `npm start` or alternatively use the following sequence:
```
npm run build
...
node -r dotenv/config ./dist/app.js
OR
npm run run
```
The `-r dotenv/config` loads the environmental variables, which is baked into the start command.

## Options
The repository comes with a `.env.example` file which showcases the possible settings there are. In order to change them, first create a new file named `.env` or rename the example file as such. Then the settings are at your disposal:
 - `DEBUG` - If set to `*` Express will log every step in handling a request. Set to anything else for normal production logs. See [Express debug documentation] for more information and other .env variables.
 - `PORT` - The port to use if none is given as a parameter when running the server. Default is `3000`.
 - `APITOKEN` - Your token to access the [random name API] with. This allows the server to fetch random names to use as room names, instead of showing a numerical ID. This setting is especially optional, but nonetheless recommended for a fun experience.
- `NODE_ENV` This has no actual use so far...

## Commands
The following NPM commands (use with `npm run [cmd]`) are available upon download:
 - `start` - builds the repository and starts the server.
 - `build` - only builds the repository, allowing for deployment on a remote server. That way you only have to install the node modules required in production.
 - `dev` - this auto build and restarts the server on any file change in the src folder. Recommended to use when actively working on the site.
 - `run` - this starts the server pre-loading the settings from the .env file.

## Authors
 - Nadine - https://github.com/katycatxnadine
 - Mitchell - https://github.com/Mitchell3514


[Express debug documentation]: https://expressjs.com/en/guide/debugging.html
[GitHub ZIP link]: https://github.com/Mitchell3514/flippz/archive/main.zip
[random name API]: http://the-one-api.dev

