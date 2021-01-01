const Flippz = require("./flipzz");

var handler = function(gameID) {
    this.id = gameID;
    this.playerLight = null;
    this.playerDark = null;
    this.gameState = "0 JOINT";
};

/*
 * The game can be in a number of different states.
 */
handler.prototype.transitionStates = {};
handler.prototype.transitionStates["0 JOINT"] = 0;
handler.prototype.transitionStates["1 JOINT"] = 1;
handler.prototype.transitionStates["2 JOINT"] = 2;
handler.prototype.transitionStates["LIGHT"] = 3; //LIGHT won
handler.prototype.transitionStates["DARK"] = 4; //DARK won
handler.prototype.transitionStates["ABORTED"] = 5;

// p is a websocket connection (ws), see app.js
handler.prototype.addPlayer = function(p) {
    console.assert(
        p instanceof Object,
        "%s: Expecting an object (WebSocket), got a %s",
        arguments.callee.name,
        typeof p
      );
    
      if (this.gameState != "0 JOINT" && this.gameState != "1 JOINT") {
        return new Error(
          "Invalid call to addPlayer, current state is %s",
          this.gameState
        );
      }
    
      /*
       * revise the game state
       */
    
      var error = this.setStatus("1 JOINT");
      if (error instanceof Error) {
        this.setStatus("2 JOINT");
      }
    
      if (this.playerLight == null) {
        this.playerLight = p;
        return "light";
      } else {
        this.playerDark = p;
        return "dark";
      }
};


handler.prototype.hasTwoConnectedPlayers = function() {
    return this.gameState == "2 JOINT";
  };
  

// module.exports = function Handler(gameID) {
//     this.id = gameID;
//     this.games = new Map();
//     this.waiting = null;
//     this.addPlayer = function(p) {

//     }
// };

module.exports = handler;

