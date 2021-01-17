// @ts-check
const Game = require("./gameHandler");
const AIGame = require("./gameAI");
const { connect } = require("../routes");
const { log, warn } = new (require("./logger"))({ prefix: "[ConnectionHandler]", color: "\x1b[36m" });
// extract the functions this.log and this.warn of the newly created Logger object.
// = new Logger(({ prefix: "[ConnectionHandler]", color: "\x1b[36m" }))

/** Adding extra attributes to connection (websocket)
 * Letting TypeScript know what is happening
 * @typedef ExtendedConnection
 * @property {number} id ---> connection.id: Way to identify the connection for the game
 * @property {Game|AIGame} game -------> connection.game: Game object for the connection
 */


let current = 0;
const getCurrentConnections = () => current;	 // required by routes/index (how many players online)

// to see what game we're connected to on client-side: if single player, new AI Game, else new normal Game
// each connection mapped to a game
function newGame(single) { return single ? new AIGame() : new Game(); }

const ConnectionHandler = function ConnectionHandler() {
	this.waiting = newGame(false);	// multiplayer; wait for 2 players
	this.single = newGame(true);
	this.connID = 0;				// gets increased with each player

	// connection is websocket sent by app.js
	this.handle = (/** @type {import("ws") & ExtendedConnection} */ connection) => {
		current++;
		connection.id = this.connID++;
		log(`New connection assigned ID of ${connection.id}`);

		// data: JSON string sent by client --> status change: position id of move in format: {position: pos.id}
		connection.on("message", (data) => {
			try {
				const payload = JSON.parse(data.toString());	// payload is stringified JSON object sent by flipzz.js
				if (typeof payload !== "object") throw new TypeError("Payload received by client is not an object");

				// ------ IF CONNECTION NOT ASSIGNED A GAME YET----------//
				// TYPE=0 is 'join game' payload
				// flipzz socket.onopen:     const payload = { type: 0, single: singleplayer };
				if (payload.type === 0 && !connection.game) {
					if (payload.single === true) {				// SINGLE PLAYER
						connection.game = this.single;			// new AIGame (singleplayer) assigned
						this.single = newGame(true);
						connection.game.addPlayer(connection);	// add player to AIgame
					} else {			// MULTI PLAYER
						let game = this.waiting;
						if (!game.addPlayer(connection)) {		// returns false if full
							game = newGame(); 				//  if full: add player to a new game
							game.addPlayer(connection);
							this.waiting = game;				 // again, wait for 2nd player
						}
						connection.game = game;				// if not full: wait dor 2nd player
						if (game.isFull()) this.waiting = newGame();	// if 2 players added, create new game
					}
					return;
				}
				// so far we only have payloads that should be handled by the game. (pos.id of moves)
				
				// ------ IF CONNECTION ALREADY IN A GAME: gameHandler called to process position (new move)---------//
				// returns false if not in format ({position: posid})); 
				if (connection.game) {
					if (!connection.game.handle(connection.id, payload)) throw new Error("Invalid game payload."); 
				} else throw new Error("Did not understand intention");
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
	getCurrentConnections,
};

