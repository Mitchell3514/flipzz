// @ts-check
const Game = require("./gameHandler");
const { log, warn } = new (require("./logger"))({ prefix: "[ConnectionHandler]", color: "\x1b[36m" });

/** Adding extra attributes to connection (websocket)
 * @typedef ExtendedConnection
 * @property {number} id Way to identify the connection for the game
 * @property {Game} game Game object for the connection
 */

 // current is used in index.ejs, required by routes/index (how many players online)
let current = 0;

// to see what game we're connected to client-side
let gameID = 0;
function newGame() { return new Game(gameID++); }

const ConnectionHandler = function ConnectionHandler() {
	/** @type {Game} */
	this.waiting = newGame();
	this.connID = 0;

	// connection is websocket + extra attributes
	this.handle = (/** @type {import("ws") & ExtendedConnection} */ connection) => {
		current++;
		connection.id = this.connID++;
		log(`New connection assigned ID of ${connection.id}`);

		let game = this.waiting;
		if (!game.addPlayer(connection)) {
			game = newGame();				// add player to a new game, if full
			game.addPlayer(connection);
			this.waiting = game;			// again, wait for 2nd player
		}
		connection.game = game;				// each connection mapped to a game
		if (game.isFull()) this.waiting = newGame();		// if 2 players added, create new game

		// data: JSON string received by client --> status change: position id of move in format: {position: pos.id}
		connection.on("message", (data) => {
			if (!connection.game) connection.send(JSON.stringify({ error: true, message: "Game hasn't been initialized yet" }));
			try {
				const payload = JSON.parse(data.toString());		// turn client's JSON string into Object 
				if (typeof payload !== "object") throw new TypeError("Payload received by client is not an object");

				// so far we only have payloads that should be handled by the game. (pos.id of moves)
				if (connection.game && !connection.game.handle(connection.id, payload)) throw new Error("Unknown payload"); // if con assigned to a game, gameHandler called
			} catch(e) {
				warn(`Could not parse following payload: ${data.toString()}`);
				connection.send(JSON.stringify({ error: true, message: e.message, payload: data })); 
			}
		});

		// once means it runs only 1x
		connection.once("close", () => {
			current--;
			if (connection.game) connection.game.leave(connection.id);
			log(`[ConnectionHandler] Connection ${connection.id} was closed.`);
		});

		connection.on("error", () => console.log("error"));
	};
};

module.exports = {
	ConnectionHandler,
	current,
};

