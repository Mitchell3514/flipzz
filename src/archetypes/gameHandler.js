// @ts-check
const Board = require("../public/js/util/board").Board;     // object (function)
const gameStats = require("../public/assets/stats.json");

/**
 * @typedef {import("./connectionHandler").ExtendedConnection} EC
 */

 // SENDS DATA TO CONNECTIONS (is game full?)
 // To client: turn (payload), total points per client? Or Flipzz?

/**
 * Status codes:
 * -1   Game aborted { status: -1}
 *  0   Game started  { status: 0, player: 0/1, turn: 0/1 } 
 *  1   Game continuing/move { status: 1, valid: true, turn: 0/1  } else {status: 1, valid: false}
 *  2   Game ended { status: 2, valid: true, position: number, winner: 0/1  }
 */

function Game(id) {
    this.id = id;
    this.status = 0;

    this.board = new Board(8, 8);
    this.board.init();

    this.dark = null;
    this.light = null;
    this.turn = 0;      // 0 is dark, 1 is light


    // TODO update stats: amount of flipped pieces sent by flipzz - gameOver()
    gameStats.flipped++;
    

    this.isFull = () => this.light && this.dark;
    
    // player added to game if not full yet, else return false
    // first added player (connection) is dark
    this.addPlayer = (/** @type {EC & import("ws")} */ connection) => {
        if (!this.dark) return (this.dark = connection, true);
        if (!this.light) return (this.light = connection, this._start(), true);     // after player 2 (light) is added, game starts
        return false;
    };

    // HANDLES A MESSAGE FROM CLIENT: a move (position id)
    // id: connection.id
    // data: payload (position id of move sent by client)
    this.handle = (/** @type {number} */ id, data) => {

        if (![this.dark.id, this.light.id].includes(id)) return false;       // ignore messages from other conns
        
        // determine what player's msg this is
        const color = +(id === this.light.id);  // + turns boolean into number?
        if (this.turn !== color) return; // ignore if not their turn

        // check if move is valid
        const result = this.board.canPlace(color);  // array of all Positions where can be placed
        let payload = { position: data.position };

        if (result.includes(data.position)) {
            payload.valid = true;

            this.board.place(data.position, color); // update board
            
            // player can place, see if next player can place
            const canPlay = this.board.canPlace(+!color);

            if (!canPlay) { // can't place - send who won
                this.status++;
                // update stats: games completed
                gameStats.games++;      
                return this._send(2, { winner: this.board.winner(), ...payload });
            }

            // next player's turn - send data
            this.turn = +!this.turn;
            this._send(2, { turn: this.turn, ...payload });
        } else {
            this._send(color, { valid: false });
        }
    };

    this.stop = (/** @type {number} */ id) => {
        this.status = -1;       // aborted
        this._send(+!id, {message: "The other player has left the game."});       // inform other player who is left
    };

    // payload is an object containing data
    // 0 --> send to dark
    // 1 --> send to light
    // 2 --> send to both   (id-1 guarantees this)
    this._send = (id, payload = {}) => {
        const msg = JSON.stringify({ id: this.id, status: this.status, ...payload });    // concatenated output string: {"status":0,"player":0,"turn":0} 
        if (id-1) this.dark.send(msg);      
        if (id) this.light.send(msg);
    };

    this._start = () => {
        this._send(0, { player: 0, turn: this.turn });  // sent to dark: payload contains player type and turn
        this._send(1, { player: 1, turn: this.turn });  // sent to light
        this.status++;
    };
}

module.exports = Game;