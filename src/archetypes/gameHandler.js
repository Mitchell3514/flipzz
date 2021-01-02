// @ts-check
const Position = require("../public/js/util/position");
const Board = require("../public/js/util/board").Board;

/**
 * @typedef {import("./connectionHandler").ExtendedConnection} EC
 */

 // SENDS DATA TO CONNECTIONS (HANDLER) isFull?
 // To client: turn (payload)

/**
 * Status codes:
 * -1   Game aborted {}
 *  0   Game started { player: 0/1 }
 *  1   Game continuing { move: number, turn: 0/1 }
 *  2   Game ended { winner: 0/1 }
 */

function Game() {
    console.log(Board);
    this.board = new Board(8, 8);
    this.board.init(Position);

    this.dark = null;
    this.light = null;

    this.turn = 0;
    

    this.isFull = () => this.light && this.dark;
    
    this.addPlayer = (/** @type {EC & import("ws")} */ connection) => {
        if (!this.dark) return (this.dark = connection, true);
        if (!this.light) return (this.light = connection, this._start(), true);
        return false;
    };

    this.handle = (/** @type {number} */ id, data) => {
        // ignore messages from other conns
        if (![this.dark.id, this.light.id].includes(id)) return false;
        
        // determine what player's msg this is
        const color = +(id === this.light.id);
        if (this.turn !== color) return; // return if not their turn

        // check if move is valid
        const result = this.board.canPlace(color);
        let payload = { position: data.position };

        if (result.includes(data.position)) {
            this.board.place(data.position, color); // update board
            
            // player can place, see if next player can place
            const canPlay = this.board.canPlace(+!color);

            if (!canPlay) { // can't place - send who won
                this.status = 2;
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
        this.status = -1;
        this._send(+!id);
    };

    this._send = (id, payload = {}) => {
        const msg = JSON.stringify({ status: this.status, ...payload });
        if (id-1) this.dark.send(msg);
        if (id) this.light.send(msg);
    };

    this._start = () => {
        this.status = 0;
        this._send(0, { player: 0, turn: this.turn });
        this._send(1, { player: 1, turn: this.turn });
    };
}

module.exports = Game;