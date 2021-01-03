// @ts-check
const Game = require("./gameHandler");

/** Adding extra attributes to connection (websocket)
 * @typedef ExtendedConnection
 * @property {number} id Way to identify the connection for the game
 * @property {Game} game Game object for the connection
 */

 // current is used in index.ejs, required by routes/index (how many players online)
let current = 0;

const ConnectionHandler = function ConnectionHandler() {
	/** @type {Game} */
	this.waiting = new Game();
	this.connID = 0;

	// connection is websocket + extra attributes
	this.handle = (/** @type {import("ws") & ExtendedConnection} */ connection) => {
		current++;
		connection.id = this.connID++;

		let game = this.waiting;
		let success = game.addPlayer(connection);
		if (!success) {
			game = new Game();				// add player to a new game, if full
			game.addPlayer(connection);
			this.waiting = game;			// again, wait for 2nd player
		} 
		connection.game = game;				// each connection mapped to a game
		if (game.isFull()) this.waiting = new Game();		// if 2 players added, create new game

		// status change received by client: position id om move
		connection.on("message", (data) => {
			if (!connection.game) connection.send(JSON.stringify({ status: -1, message: "Game hasn't been initialized yet" }));
			try {
				const payload = JSON.parse(data.toString());
				// payload is a move sent by client here
				if (connection.game) connection.game.handle(connection.id, payload);		// if con assigned to a game, gameHandler called
			} catch(e) { console.log(`Couldn't parse the following message as JSON: ${data.toString()}`); }
		});

		// once means it runs only 1x
		connection.once("end", () => {
			current--;
			if (connection.game) {
				connection.game.stop(connection.id);
				if (connection.game === this.waiting) this.waiting = null;		// if only 1 player waiting for 2nd player, stop the game
			}
		});
	};
};

module.exports = {
	ConnectionHandler,
	current,
};

