// @ts-check
const CFG = require("../public/js/util/config");
const Board = require("../public/js/util/board").Board;     // object!! (function)
const { updateStats } = require("./statsHandler") // eslint-disable-line
const { log } = new (require("./logger"))({ prefix: "[GameHandler]", color: "\x1b[32m" });
const { getName } = require("./randomName");

/**
 * @typedef {import("./connectionHandler").ExtendedConnection} EC
 */

 // SENDS REVEVANT DATA TO CONNECTIONS (is game full?)

/**
 * Status codes:
 * -1   info    { gameID: number, name: string }
 *  0   start   { player: 0|1, turn: 0|1 } 
 *  1   move    { valid: boolean, position: number, turn: 0|1, message?: string  }
 *  2   end     { valid: true, position: number, winner: 0|1  }
 *  3   stop    { message: string }
 */

let id = 0;
function Game(single = false) {
    this.id = id++;
    this.name = "";
    getName()
        .then(name => this.name = name)
        .catch(() => {})
        .finally(() => log(`${single ? "Singleplayer " : ""}Game ${this.id} (${this.name}) has been initiated.`));
    this.status = -1;       // waiting state

    this.board = new Board(CFG.boardsize, CFG.boardsize);
    this.board.init();

    this.dark = null;       // dark and light are both assigned ws connections
    this.light = null;
    this.startingcolor = Math.round(Math.random());

    this.turn = 0;      // 0 is dark, 1 is light

    // stats
    this.flipped = 0;
   

    this.isFull = () => this.light && this.dark;

    // Called by connectionhandler when ws closes: connection.game.leave(connection.id);
    this.leave = (/** @type {number} */ id) => {
        if (this.status > 1) return; // if already quit ignore
        if (this.dark && !this.light) return this.dark = null; // simply remove
        if (!this.dark && this.light) return this.light = null; // if only player   

        this.status = 3;       // aborted --> status 3
        // 0 --> send to dark
        // 1 --> send to light
        // 2 --> send to both  
        this._send(+!(id === this.light.id), {message: "The other player has left the game."});       // inform other player who is left.
        id ? this.light.game = null : this.dark.game = null; // remove this game from other connection.

        this._updateStats({ flipped: this.flipped }); // add to stats.
        log(`Game ${this.id} (${this.name}) stopped due to Connection ${id} leaving.`); // log.
    };



    this._start = () => {
        this.status++;          // -1 becomes 0 --> game starts
        this._send(0, { player: 0, turn: this.turn });  // sent to dark: payload contains player type and turn
        this._send(1, { player: 1, turn: this.turn });  // sent to light
        this.status++;                                  //  0 --> 1 (game continuing/move)
        this._updateStats({ games: 1 });
        log(`Game ${this.id} (${this.name}) has begun.`);
    };



    this._updateStats = (obj) => {
        updateStats(obj);               // statsHandler (required)
    };
}

// ---------------- Prototype constructor: share functions + inheritance (GameAI and GameHandler)----------------//

// player added to game if not full yet, else return false
// first added player (connection) is dark
Game.prototype.addPlayer = function(/** @type {EC & import("ws")} */ connection) {
    log("ADDED PLAYER");
    let color = null;
    if (this.startingcolor === 0) {     // random starting color: 0 = dark, 1 = light
         // ASSIGNS WS CONNECTIONS TO dark/light (if not null), depending on which one starts
        if (!this.dark) (this.dark = connection, color = 0);
        else if (!this.light) (this.light = connection, color = 1);
    } else {
        if (!this.light) (this.light = connection, color = 1);
        else if (!this.dark) (this.dark = connection, color = 0);
    }
    if (color === null) return false;

    this._send(color, { gameID: this.id, name: this.name });
    log(`Connection ${connection.id} has been added to Game ${this.id} (${this.name}) as ${["black", "white"][color]}.`); // color = 0 gives black
    if (this.isFull()) this._start();
    return true;
};



// HANDLES A MESSAGE FROM CLIENT: a move (position id)
// id: connection.id
// data: payload as JSON object (position id of move sent by client) sent by connectionHandler
// returns false if not in format ({position: posid})); 
Game.prototype.handle = function(/** @type {number} */ id, data) {
    if (![this.dark?.id, this.light?.id].includes(id)) return false;       // ignore messages from other conns
    if (!data || typeof data.position !== "number") return false;
    
    // determine what player's msg this is: if id matches id of player light's ws connection, color = 1
    const color = +(id === this.light.id);  // + turns boolean into number
    if (this.turn !== color) return (this._send(color, { valid: false, reason: "Other player's turn." }), true); // ignore if not their turn

    // check if move is valid
    const result = this.board.canPlace(color);  // array of all Positions where can be placed
    let payload = { position: data.position };      // Object sent by client must be in form: {position: pos.id}

    if (result.some(pos => pos.id === data.position)) {       // if the position sent is one of the placeable
        payload.valid = true;

        //  array of Positions where color has changed
        const flipped = this.board.place(data.position, color); // update board: (pos.id, color)
        this.flipped += (flipped.length - 1); // -1 because of self-placement, only add the new chips to score!
        
        // player can place, see if next player can place
        const canPlace = this.board.canPlace(+!color);       // array of all Positions where can be placed by other player

        if (!canPlace.length) { // other player can't place - send who won
            this.status++; // status 1 --> status 2 = game end, winner
            const winner = this.board.winner();
            log(`[GameHandler] Game ${this.id} (${this.name}) has been won by ${winner === -1 ? "no one" : ["black", "white"][winner]}.`);

            // ---------- IF GAME COMPLETED --------------------------------------
            this._updateStats({ flipped: this.flipped });
            return (this._send(2, { winner: winner, ...payload }), true);      // 2 = send to both --> winner (0/1) + payload (pos id)
        }

        // next player's turn - send data
        this.turn = +!this.turn;
        // ------------IF VALID MOVE-------------------------------------------------
        this._send(2, { turn: this.turn, ...payload });         // 2 = send to both: valid + next turn + payload (pos id validated)
    } else {
        // ----------IF INVALID MOVE-------------------------------------------------
        this._send(color, { valid: false, reason: "Invalid move." });                    // sent to (color =) 0/1, player (conn) who sent move
    }
    return true;
};

// payload is an object containing data
// 0 --> send to dark
// 1 --> send to light
// 2 --> send to both   (color-1 guarantees this)
Game.prototype._send = function(clr, payload = {}) {
    const msg = JSON.stringify({ status: this.status, ...payload });    // concatenated output string: {"status":0,"player":0,"turn":0} 
    if (clr-1) this.dark.send(msg);      
    if (clr) this.light.send(msg);
};

module.exports = Game;