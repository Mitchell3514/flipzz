# flipzz
Othello's time has come; introducing Flippz. A refreshed online multiplayer experience for a game that never gets old. You can see the live version of this repository [here][liveURL].

> This is a small 4 week project for Delft University of Technology's Web and Database technology classes.

## Installation
First of all, make sure you're using **npm v14 or higher.** We recommend using [nvm] to help you with this.

### Download
You can either download the code directly as a ZIP file [here][GitHub ZIP link], or use the command below:
```
git clone https://github.com/Mitchell3514/flippz.git
```
After succesfully downloading (and extracting) the files, run `npm i` to download the required packages.

> It may take a while for webp to download and build. If you are facing issues with npm not understanding the lock-file, make sure you're using npm v14. If you are still having issues, then try upgrading to the latest npm version (currently 15).

### Building
If you are running the server from the same place as you downloaded it, you may skip to the next step.

You are now ready to build the files, which makes server-client communication more efficient. Run the following npm command:
```
npm run build
```
This will compress images and create a new `dist` folder from which the server will be ran.
### Starting the server
> Before starting the server you might want to change some options. (see below)

If you simply want to run the server in the same folder, execute `npm start`. This will first build all the files and then start the server.

Alternatively, if you have already built the files you can either run:
```
npm run run
OR 
node -r dotenv/config ./dist/app PORT#
```
Replace `PORT#` with the desired port to run on or leave it out to default to the one set in your .env file.

## Options
The repository comes with a `.env.example` file which showcases the possible settings there are. In order to change them, first create a new file named `.env` or rename the example file as such. Then these settings are at your disposal:
 - `DEBUG` - If set to `*` Express will log every step in handling a request. Set to anything else for normal production logs. See [Express debug documentation] for more information and other variables.
 - `PORT` - The port to use if none is given as a parameter when running the server. Default is `3000`.
 - `APITOKEN` - Your token to access the [random name API] with. This allows the server to fetch random names to use as room names, instead of showing a numerical ID. This setting is particularly optional, but nonetheless recommended for a fun experience.
 - `NODE_ENV` - If set to `DEV` any server error when requesting a page will be rendered client-side. 
 Setting it to `PROD` will log IPs without hashing on 404s to more easily block malicious requests.

## Scripts
The following NPM scripts (use with `npm run [name]`) are available upon download:
 - `start` - builds the repository and starts the server. Alias `npm start`
 - `build` - only builds the repository, allowing for deployment on a remote server. That way you only have to install the node modules required in production.
 - `dev` - this auto builds and restarts the server on any file change in the src folder. Recommended to use when actively working on the site.
 - `run` - this starts the server pre-loading the settings from the .env file.

## Authors
 - Nadine - https://github.com/katycatxnadine
 - Mitchell - https://github.com/Mitchell3514

## Credits
 - [Volume Icons](https://iconscout.com/icon-pack/ui-elements-1) by [Vaadin Icons](https://iconscout.com/contributors/vaadin-icons)


[liveURL]: http://mitchells.work:3000/
[Express debug documentation]: https://expressjs.com/en/guide/debugging.html
[GitHub ZIP link]: https://github.com/Mitchell3514/flippz/archive/main.zip
[random name API]: http://the-one-api.dev
[nvm]: https://github.com/nvm-sh/nvm

