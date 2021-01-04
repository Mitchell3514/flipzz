// @ts-check
const CFG = require("../public/js/util/config");
const Board = require("../public/js/util/board").Board;     // object (function)
const { writeFile } = require("fs"); // @ts-expect-error ROOT not defined globally 
const dataURI = require("path").join(ROOT, "../stats.json"); // eslint-disable-line

const https = require("https");
const names = [];
function getName() {
    if (names.length) return Promise.resolve(names.splice(0, 1)[0]);
    return fetchNames();
}
let stop = false;
function fetchNames() {
    return new Promise((resolve, reject) => {
        if (stop) reject();
        https.get("https://api.fungenerators.com/name/generate.json?category=alien").on("response", (response) => {
            let str = "";
            response.on("data", data => str += data);
            response.once("end", () => {
                try {
                    const payload = JSON.parse(str);
                    if (payload.error) return stop = true;
                    const nameArray = payload?.content?.names;
                    if (!nameArray) throw new Error(str);
                    const name = nameArray.splice(0, 1)[0];
                    names.push(...nameArray);
                    resolve(name);
                } catch (e) { console.error(`Unable to get random names\n${e}`); reject(e); }
            });
        });
    });
}

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
    getName().then(name => this.name = name).catch(() => this.name = "none");
    this.status = -1;

    this.board = new Board(CFG.boardsize, CFG.boardsize);
    this.board.init();

    this.dark = null;       // dark and light are both assigned ws connections
    this.light = null;
    this.turn = 0;      // 0 is dark, 1 is light

    // stats
    this.flipped = 0;
   

    this.isFull = () => this.light && this.dark;
    
    // player added to game if not full yet, else return false
    // first added player (connection) is dark
    this.addPlayer = (/** @type {EC & import("ws")} */ connection) => {
        if (!this.dark) return (this.dark = connection, this._send(0, { gameID: this.id, name: this.name }), true);
        if (!this.light) return (this.light = connection, this._send(1, { gameID: this.id, name: this.name }), this._start(), true);     // after player 2 (light) is added, game starts
        return false;
    };

    // HANDLES A MESSAGE FROM CLIENT: a move (position id)
    // id: connection.id
    // data: payload as JSON object (position id of move sent by client) sent by connectionHandler
    this.handle = (/** @type {number} */ id, data) => {
        if (![this.dark?.id, this.light?.id].includes(id)) return false;       // ignore messages from other conns
        if (!data || !data.position) return false;
        
        // determine what player's msg this is: if id matches id of player light's ws connection, color = 1
        const color = +(id === this.light.id);  // + turns boolean into number
        if (this.turn !== color) return (this._send(color, { valid: false, reason: "Other player's turn." }), true); // ignore if not their turn

        // check if move is valid
        const result = this.board.canPlace(color);  // array of all Positions where can be placed
        let payload = { position: data.position };      // Object sent by client must be in form: {position: pos.id}

        if (result.some(pos => pos.id === data.position)) {       // if the position sent is placeable
            payload.valid = true;

            const flipped = this.board.place(data.position, color); // update board: (pos.id, color)
            this.flipped += (flipped.length - 1);
            
            // player can place, see if next player can place
            const canPlay = this.board.canPlace(+!color);       // array of all Positions where can be placed by other player

            if (!canPlay) { // other player can't place - send who won
                this.status++; // status 1 --> status 2

                // ---------- IF GAME COMPLETED --------------------------------------
                return this._send(2, { winner: this.board.winner(), ...payload });      // 2 = send to both --> winner (0/1) + payload (pos id)
            }

            // next player's turn - send data
            this.turn = +!this.turn;
            // ------------IF VALID MOVE-------------------------------------------------
            this._send(2, { valid: true, turn: this.turn, ...payload });         // 2 = send to both: valid + next turn + payload (pos id validated)
        } else {
            // ----------IF INVALID MOVE-------------------------------------------------
            this._send(color, { valid: false, reason: "Invalid move." });                    // sent to (color =) 0/1, player (conn) who sent move
        }
        return true;
    };

    this.leave = (/** @type {number} */ id) => {
        if (!this.light && this.dark?.id === id) return this.dark = null;
        this.status = 3;       // aborted --> status 3
        this._send(+!(id === this.light.id), {message: "The other player has left the game."});       // inform other player who is left
        this._updateStats({ flipped: this.flipped });
    };

    // payload is an object containing data
    // 0 --> send to dark
    // 1 --> send to light
    // 2 --> send to both   (id-1 guarantees this)
    this._send = (id, payload = {}) => {
        const msg = JSON.stringify({ status: this.status, ...payload });    // concatenated output string: {"status":0,"player":0,"turn":0} 
        if (id-1) this.dark.send(msg);      
        if (id) this.light.send(msg);
    };

    this._start = () => {
        this.status++;
        this._send(0, { player: 0, turn: this.turn });  // sent to dark: payload contains player type and turn
        this._send(1, { player: 1, turn: this.turn });  // sent to light
        this.status++;                                  // status 0 sent, but now becomes status 1 (game continuing)
        this._updateStats({ games: 1 });
    };

    this._updateStats = (obj) => {
        const file = require(dataURI);
        Object.keys(obj).forEach(key => file[key] !== undefined ? file[key] += obj[key] : file[key] = obj[key]);
        writeFile(dataURI, JSON.stringify(file), (e) => { if (e) console.log(e || `Updated stats: ${file}`); });
    };
}

module.exports = Game;