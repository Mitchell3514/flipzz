// @ts-check
const Game = require("./gameHandler");

/**
 * @typedef ExtendedConnection
 * @property {number} id Way to identify the connection for the game
 * @property {Game} game Game object for the connection
 * @property {number} color 0=dark, 1=light
 */

const ConnectionHandler = function ConnectionHandler() {
	/** @type {Game} */
	this.waiting = new Game();
	this.connID = 0;

	this.handle = (/** @type {import("ws") & ExtendedConnection} */ connection) => {
		connection.id = this.connID++;
		connection.color = +this.waiting;

		let game = this.waiting;
		let success = game.addPlayer(connection);
		if (!success) {
			game = new Game();
			game.addPlayer(connection);
			this.waiting = game;
		}
		if (game.isFull()) this.waiting = new Game();

		connection.on("message", (data) => {
			if (connection.game) connection.game.handle(connection.id, JSON.parse(data.toString()));
			else connection.send(JSON.stringify({ status: -1, message: "Game hasn't been initialized yet" }));
		});

		connection.once("end", () => {
			if (connection.game) {
				connection.game.stop(connection.id);
				if (connection.game === this.waiting) this.waiting = null;
			}
		});
	};
};

module.exports = ConnectionHandler;

