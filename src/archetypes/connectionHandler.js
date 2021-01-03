// @ts-check
const Game = require("./gameHandler");

/** Adding extra attributes to connection (websocket)
 * @typedef ExtendedConnection
 * @property {number} id Way to identify the connection for the game
 * @property {Game} game Game object for the connection
 */

 // current is used in index.ejs, required by routes/index (how many players online)
let current = 0;

// to see what game we're connected to client-side
let gameID = 0;

const ConnectionHandler = function ConnectionHandler() {
	/** @type {Game} */
	this.waiting = new Game();		// TODO no gameID assigned?
	this.connID = 0;

	// connection is websocket + extra attributes
	this.handle = (/** @type {import("ws") & ExtendedConnection} */ connection) => {
		current++;
		connection.id = this.connID++;

		let game = this.waiting;
		let success = game.addPlayer(connection);
		if (!success) {
			game = new Game(gameID++);				// add player to a new game, if full
			game.addPlayer(connection);
			this.waiting = game;			// again, wait for 2nd player
		} 
		connection.game = game;				// each connection mapped to a game
		if (game.isFull()) this.waiting = new Game();		// if 2 players added, create new game

		// data: JSON string received by client --> status change: position id of move in format: {position: pos.id}
		connection.on("message", (data) => {
			if (!connection.game) connection.send(JSON.stringify({ error: true, message: "Game hasn't been initialized yet" }));
			try {
				const payload = JSON.parse(data.toString());		// turn client's JSON string into Object 
				if (typeof payload !== "object") throw new TypeError("Payload received by client is not an object");

				// so far we only have payloads that should be handled by the game. (pos.id of moves)
				if (connection.game) connection.game.handle(connection.id, payload);		// if con assigned to a game, gameHandler called
			} catch(e) { 
				console.log(`Error parsing the following payload: ${data.toString()}`);
				connection.send(JSON.stringify({ error: true, message: e.message, received: data })); 
			}
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

