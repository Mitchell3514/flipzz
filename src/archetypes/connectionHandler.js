// @ts-check
const Game = require("./gameHandler");

/** Adding extra attributes to connection (websocket)
 * @typedef ExtendedConnection
 * @property {number} id Way to identify the connection for the game
 * @property {Game} game Game object for the connection
 */

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
			game = new Game();
			game.addPlayer(connection);
			this.waiting = game;
		} 
		connection.game = game;
		if (game.isFull()) this.waiting = new Game();

		// status change received by client (move, ...)
		connection.on("message", (data) => {
			if (!connection.game) connection.send(JSON.stringify({ status: -1, message: "Game hasn't been initialized yet" }));
			try {
				const payload = JSON.parse(data.toString());
				if (connection.game) connection.game.handle(connection.id, payload);
			} catch(e) { console.error(e); }
		});

		// once means it runs only 1x
		connection.once("end", () => {
			current--;
			if (connection.game) {
				connection.game.stop(connection.id);
				if (connection.game === this.waiting) this.waiting = null;
			}
		});
	};
};

module.exports = {
	ConnectionHandler,
	current,
};

