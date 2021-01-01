// @ts-check
const http = require("http");
const createError = require('http-errors');
const express = require('express');
const { join } = require('path');
const logger = require('morgan');
const websocket = require('ws');

// routers
const indexRouter = require('./routes/index');
const gameHandler = require("./archetypes/gameHandler.js");
// import messages.js file <-- shared between client and server!!
const messages = require("./public/js/messages.js");
const gameStats = require("./public/assets/stats.json");

const app = express();

// set express' static file path  (path.join works in all OS types)
// uses this for EVERY request (GET, POST, PUT...)
app.use(express.static(join(__dirname, 'public')));

// view engine setup: views directory contains all templates
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use('/', indexRouter);

// catch 404 and forward to error handler (middleware)
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  next();
});

// TODO move to main
// we want to store our connections globally (array)
global.connections = [];

const server = http.createServer(app).listen(process.argv[2] ?? process.env.PORT ?? 3000);
// create websocket object
const wss = new websocket.Server({ server });

// We keep track of which client is assigned to which game by mapping a WebSocket connection (the property) to a game (the value)
var websockets = {}; //property: websocket, value: game

/*
 * regularly clean up the websockets object
 */
setInterval(function() {
  for (let i in websockets) {
    if (Object.prototype.hasOwnProperty.call(websockets,i)) {
      let gameObj = websockets[i];
      //if the gameObj has a final status, the game is complete/aborted
      if (gameObj.finalStatus != null) {
        delete websockets[i];
      }
    }
  }
}, 50000);


let currentGame = new gameHandler(gameStats.games++);
let connectionID = 0; //each websocket receives a unique ID

wss.on("connection", function connection(ws) {
 /*
   * two-player game: every two players are added to the same game
   */
  // add the player to the game currently missing a player 
  let con = ws;
  con.id = connectionID++;
  let playerType = currentGame.addPlayer(con);
  websockets[con.id] = currentGame; // each con.id mapped to a game

  console.log(
    "Player %s placed in game %s as %s",
    con.id,
    currentGame.id,
    playerType
  );

    /*
   * inform the client about its assigned player type
   */
  con.send(playerType == "light" ? messages.S_PLAYER_A : messages.S_PLAYER_B);

 
  /*
   * once we have two players, there is no way back;
   * a new game object is created;
   * if a player now leaves, the game is aborted (player is not preplaced)
   */
  if (currentGame.hasTwoConnectedPlayers()) {
    currentGame = new gameHandler(gameStats.games++);
  }


    /*
   * message coming in from a player:
   *  1. determine the game object
   *  2. determine the opposing player OP
   *  3. send the message to OP
   */// TODO send this message from client to server (a move)
  con.on("message", function incoming(message) {
      let oMsg = JSON.parse(message);

      let gameObj = websockets[con.id];   // value: a gameHandler
      // playerLight is an attribute of gameHandler
      let isPlayerLight = gameObj.playerLight == con ? true : false;

      if (isPlayerLight) { 
          if (gameObj.hasTwoConnectedPlayers()) {
            gameObj.playerB.send(message);
          }
        }

        else {
          gameObj.playerA.send(message);
    
          if (oMsg.type == messages.T_GAME_WON_BY) {
            gameObj.setStatus(oMsg.data);
            //game was won by somebody, update statistics
            gameStats.games++;
          }
        }
      } 


      con.on("close", function(code) {

      });

      
  });





});

