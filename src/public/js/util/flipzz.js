// @ts-check
// NO REQUIRES ON THE CLIENT SIDE!

// For each client, we create a new WebSocket, so each player has its own ws connection with server
const socket = new WebSocket("ws://localhost:3000");
const board = new Classes.Board(CFG.boardsize, CFG.boardsize);
// position, config and board get imported in game.ejs, BEFORE flipzz

let totalflipped = 0;       // TODO send to server in gameOver() to update stats.json (or can stats.json be updated from here?)
let dark = 2;
let light = 2;
let turn = 0;
let stopped = false;
let gameID;
const playerturn = document.querySelector('#turn');
const gamestat = document.querySelector('#message');
const scoredark = document.querySelector('#points-you');
const scorelight = document.querySelector('#points-opponent');
const grids = document.querySelectorAll(".chip");               // all cell divs (to be clicked by user)



socket.onopen = function() {
    console.log("CLIENT SENT HELLO TO SERVER...");
    let clientmessage = "Hello from the client";
    socket.send(JSON.stringify({string: clientmessage}));       // JSON object: attribute-value pairs
}


/**
 * Status codes:
 * -1   Game aborted { status: -1}
 *  0   Game started  { status: 0, player: 0/1, turn: 0/1 } 
 *  1   Game continuing/move { status: 1, valid: true, turn: 0/1  } else {status: 1, valid: false}
 *  2   Game ended { status: 2, valid: true, position: number, winner: 0/1  }
 */

socket.onmessage = function(event) {
    let message = JSON.parse(event.data);       // unpack (string --> object) message received by server
    console.table(message);

    if (message.error) return console.error(`Received error from server: ${message.message}\nOur payload was: ${message.payload}`);
    
    switch(message.status) {
        case(-1):
            gameID = message.id;
            break;

        case(0):
            console.log("2 PLAYERS JOINED: GAME START");
            if(message.player == 0) {                               // message.player is type assigned to this player (light/dark)
                gamestat.innerHTML = "You are player dark :)";      // replace "waiting for player 2"
            } else {
                gamestat.innerHTML = "You are player light :)";
            }
            if (message.turn == 0) {
                playerturn.innerHTML = "Turn: dark"
            } else {
                playerturn.innerHTML = "Turn: light"
            }
            if (message.player == message.turn) {
                enableEventListener();                 // enable eventListener for player who has first turn
            }
            break;

        case(1):
            console.log("NEW MOVE VALIDATED BY SERVER");
            // SENT TO BOTH CLIENTS --> { status: 1, valid: true, turn: 0/1  }
            // case 1: This player's move has just been validated, turn switches
            // case 2: Other player's move has just been validated, now it's your turn
            if (message.valid) {
                let validpos = message.position;                     // payload (pos id) sent back by server to BOTH clients
                let newposition = new Classes.Position(validpos);      // BOTH clients need to place to update board!!
                place(newposition);  
                if (message.turn != turn) {    // if player has switched turn
                    gamestat.innerHTML = "Waiting for other player to place a chip...";
                    disableEventListener();
                }
                if (message.turn == turn) {    // if this player now has turn, enable eventListener
                    enableEventListener();                  
                }
            } else {
                gamestat.innerHTML = "Invalid move!";
            }
            break;

        case(2):
            console.log("GAME ENDED! Restart game?");
            gameOver();
            // TODO  add restart game button to innerHTML game.ejs in gameOver()
            break;

        case(3):
            console.log("GAME ABORTED");
            gamestat.innerHTML = "The other player has left the game :(";
            break;
        
        default:
            console.log("NO KNOWN STATUS RECEIVED BY SERVER");
    }

}

  //server sends a close event only if the game was aborted from some side
socket.onclose = function() {
    console.log("WEBSOCKET CLOSED");
}

socket.onerror = function(event) {
    console.log(event);
}


document.addEventListener("DOMContentLoaded", pageLoaded);

function pageLoaded() {
    console.log("PAGE FULLY LOADED")
}

function enableEventListener() {
    // add eventlisteners to all cells
    for(let g of grids){
    g.addEventListener("click", mouseClick);
    }   
}

// This method is not really necessary, since gameHandler ignores move if it's not their turn. But still less server load.
function disableEventListener() {
    for(let g of grids){
        g.removeEventListener("click", mouseClick);
    }   
}

function mouseClick() { // the clicked element
    console.log(this.dataset["pos"]);
    if (!this.classList.contains("chip")) return;   // not a chip
                                                    // dataset contains all attributes starting with data-.... (see data-pos in game.ejs)
    const posid = parseInt(this.dataset["pos"]);     // get pos-data from TD (numbers 0, 1, 2, .... 63)

    if (isNaN(posid)) return;
    else {
        // THIS player sends position to be validated by server
        // If its not his turn, gameHandler ignores.
        socket.send(JSON.stringify({position: posid}));          // send OBJECT with Position id propery to server --> connectionHandler calls gameHandler --> verifies
    }       
}
    

const firstFour = board.init();                             // array of Positions (first 4)
for (const pos of firstFour) {setColor(pos);}                // color first 4
for (const pos of board.canPlace(turn)) {setColor(pos);}    // color the placeable cells 
scoredark.innerHTML = `${dark}`;
scorelight.innerHTML = `${light}`;
playerturn.innerHTML = `Turn: ${turn ? "light" : "dark"}`;  // dark = 0, light = 1


// CSS: adds the colored piece to the board
function setColor(pos) {
    const el = document.querySelector(`[data-pos="${pos.id}"]`);    // get the cell that has to become colored
    el.classList.remove("dark", "light", "placeable");
    switch (pos.color) {
        case 0: 
            el.classList.add("dark");
            break;
        case 1:
            el.classList.add("light");
            break;
        default:
            el.classList.add("placeable");
            break;
    }
}

const gameOver = () => {
    console.log("GAME OVER");
    playerturn.innerHTML = `Winner: ${light > dark ? "light" : light === dark ? "tie" : "dark"}`;
    stopped = true;
    //TODO add restart game button
    // TODO send totalflipped to server (or can we change stats.json from here?)
}

function switchTurn() {
    turn = +!turn;
    playerturn.innerHTML = `Turn: ${turn ? "light" : "dark"}`;
}


// Sends Position (id) to server (moves) --> server sends game update to client B
function place(pos) {
    if (stopped) return

    const toChange = board.place(pos, turn);        // array of Positions sthat hould change color (just placed + flipped)
    if (!toChange.length) return;                   // nothing flipped

    // remove placeable signs
    document.querySelectorAll(".placeable").forEach(el => el.classList.remove("placeable"));

    // Color all positions that have just been flipped (and the 1 placed)
    for (const pos of toChange)
        {setColor(pos);}

    // Change score
    const amount = toChange.length;     // score is how much has just changed color
    totalflipped += amount;
    if (turn) {dark -= (amount-1), light += (amount) }  // if light had turn, assign light's points and subtract dark's points
    else { light -= (amount-1), dark += (amount) }
    scoredark.innerHTML = `${dark}`;
    scorelight.innerHTML = `${light}`;

    // switch turns and color placeable cells for next player
    switchTurn();
    let placeable = board.canPlace(turn);       // array of Positions that are placeable
    if (!placeable.length) {                    // nothing to place, so switch turn again
        switchTurn();
        placeable = board.canPlace(turn);
        if (!placeable.length) return gameOver();       // if no one can place, game over...
    }

    // enable placeables (Position objects)
    for (const pos of placeable)
        {setColor(pos);}
}

