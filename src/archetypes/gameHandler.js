const Flippz = require("./flipzz");

module.exports = function Handler(gameID) {
    this.id = gameID;
    this.games = new Map();
    this.waiting = null;
};

