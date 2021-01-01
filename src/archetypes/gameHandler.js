const Flippz = require("./flipzz");

var handler = function(gameID) {
    this.id = gameID;
    this.games = new Map();
    this.waiting = null;
};

handler.prototype.addPlayer = function(p) {
    // ??
}

// module.exports = function Handler(gameID) {
//     this.id = gameID;
//     this.games = new Map();
//     this.waiting = null;
//     this.addPlayer = function(p) {

//     }
// };

module.exports = handler;

