const GameHandler = require("./gameHandler");
const { log, warn } = new (require("./logger"))({ prefix: "[AIGame]", color: "\x1b[32m" });

function GameAI() { 

    // ---------------- Prototype design pattern: share functions + inheritance (GameAI and GameHandler)----------------//
        // gameHandler methods are re-used (shared), but modified.

    GameHandler.call(this, true)        // gameHandler functions used/shared. (this = gameHandler function, single = true)

    //server adds itself as 2nd player
    this.addPlayer = (connection) => {
        log(`Starting in singleplayer mode with ${connection.id}`);
        GameHandler.prototype.addPlayer.call(this, { id: GameAI.aID });     // shared function: called with this connection
        GameHandler.prototype.addPlayer.call(this, connection);
        this.player = { id: connection.id };            // player sent by connectionhandler
        this.ai = +(this.light.id === GameAI.aID);      // 0, so AI is dark.
        if (this.turn === this.ai) this.act();
        return true;
    };

// calls act 
    this.handle = (/** @type {number} */ id, data) => {
        const result = GameHandler.prototype.handle.call(this, id, data);
        return result ? (this.act(), true) : false;
    };

    // only sends ws message to player if it's the player
    this._send = (/** @type {number} */ clr, payload) => {
        if ([this.dark, this.light][clr]?.id === GameAI.aID) return;
        if (clr === 2) { if (this.player) clr = +!this.ai; else return; }
        GameHandler.prototype._send.call(this, clr, payload); 
    };

    // places a bot after a valid move of the player
    this.act = async () => {
        if (this.status !== 1) return;
        setTimeout(() => {
            const possibilities = this.board.canPlace(this.ai);
            const pos = possibilities[Math.floor(Math.random() * possibilities.length)];        // pick a random position
            if (!pos) return warn(`GameAI [${this.id}] did not see a move.`)
            GameHandler.prototype.handle.call(this, GameAI.aID, { position: pos.id });
        }, ((Math.random() * 1.5) + .5)*1000);
    };
};

GameAI.aID = 2557;


module.exports = GameAI;