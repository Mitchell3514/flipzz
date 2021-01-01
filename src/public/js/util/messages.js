// share JavaScript code between our server-side and client-side JavaScript runtime.

(function(exports) {
    /*
     * Client to server: game is complete, the winner is ...
     */
    exports.T_GAME_WON_BY = "GAME-WON-BY";
    exports.O_GAME_WON_BY = {
      type: exports.T_GAME_WON_BY,
      data: null
    };
  
    /*
     * Server to client: abort game (e.g. if second player exited the game)
     */
    exports.O_GAME_ABORTED = {
      type: "GAME-ABORTED"
    };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);
  

    /*
     * Server to client: set as player A
     */
    exports.T_PLAYER_TYPE = "PLAYER-TYPE";
    exports.O_PLAYER_LIGHT = {
      type: exports.T_PLAYER_TYPE,
      data: "LIGHT"
    };
    exports.S_PLAYER_LIGHT = JSON.stringify(exports.O_PLAYER_LIGHT);
  
    /*
     * Server to client: set as player B
     */
    exports.O_PLAYER_DARK = {
      type: exports.T_PLAYER_TYPE,
      data: "DARK"
    };
    exports.S_PLAYER_DARK = JSON.stringify(exports.O_PLAYER_DARK);
  
    /*
     * Player B to server OR server to Player A
     */
    exports.T_GAME_MOVE = "GAME_MOVE";
    exports.O_GAME_MOVE = {
      type: exports.T_GAME_MOVE,
      data: null
    };
    //exports.S_GAME_MOVE does not exist, as data needs to be set
  
    /*
     * Server to Player A & B: game over with result won/loss
     */
    exports.T_GAME_OVER = "GAME-OVER";
    exports.O_GAME_OVER = {
      type: exports.T_GAME_OVER,
      data: null
    };

    /*
     * Server to Player A & B: game over with result won/loss
     */
    exports.T_GAME_START = "GAME-START";
    exports.O_GAME_START = {
      type: exports.T_GAME_START,
      data: null
    };


  })(typeof exports === "undefined" ? (this.Messages = {}) : exports);
  //if exports is undefined, we are on the client; else the server
  