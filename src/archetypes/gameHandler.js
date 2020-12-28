const Flippz = require("./flipzz");
module.exports = function Handler() {
    this.games = new Map();
    this.waiting = null;
};

