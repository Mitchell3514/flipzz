// @ts-check
// NO REQUIRES ON THE CLIENT SIDE!

//TODO Status "Invalid move! Still your turn" should disappear again after next move.

// @ts-ignore For each client, we create a new WebSocket, so each player has its own ws connection with server
const socket = new WebSocket(document.location.origin.replace("http", "ws"));
/** @type {import("./Board").Board} */ // @ts-expect-error
const board = new Classes.Board(CFG.boardsize, CFG.boardsize);
// position, config and board get imported in game.ejs, BEFORE flipzz
let darkpoints = 2;
let lightpoints = 2;
let turn = 0;
let stopped = false;
let color;                    // 0 is dark, 1 is light
let gamestatus;

/** @type {HTMLDivElement} */
const statusdiv = document.querySelector("div#status");
/** @type {HTMLSpanElement} */
const statusMessage = document.querySelector("p#status-body");
const pointsYou = document.querySelector("#points-you");
const pointsOpponent = document.querySelector("#points-opponent");
let pointsPlayer;       // defined in function setPlayerType(), either light or dark
const roomName = document.querySelector("#status-name");




socket.onopen = function() {
    console.log("CLIENT SENT HELLO TO SERVER...");
    let clientmessage = "Hello from the client";
    socket.send(JSON.stringify({string: clientmessage}));       // JSON object: attribute-value pairs
};


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
    
    if (message.status !== undefined) gamestatus = message.status;

    switch(message.status) {
        case(-1):
            if (message.name) roomName.innerHTML = `Room name: ${message.name}`;
            else roomName.innerHTML = `Room ID: ${message.gameID}`;
            
            break;

        case(0):
            gamestatus = 1;
            console.log("2 PLAYERS JOINED: GAME START");
            startTimer();

            // init board
            for (const pos of board.init()) 
                setColor(pos); // set board to init position

            // parse data
            color = message.player;         // 0 is dark, 1 is light
            setPlayerType();

            // change status
            if (message.turn === color) (updateStatus("It's your turn!"), updatePlaceable());
            else updateStatus("Waiting for the opponent's move.");

            break;

        case(1):
            console.log("NEW MOVE VALIDATED BY SERVER");
            // SENT TO BOTH CLIENTS --> { status: 1, valid: true, turn: 0/1  }
            // case 1: This player's move has just been validated, turn switches
            // case 2: Other player's move has just been validated, now it's your turn
            if (message.valid) {
                let validpos = message.position;                     // payload (pos id) sent back by server to BOTH clients
                place(validpos);                                       // BOTH clients need to place to update board!!
                turn = message.turn;                                  // change turn after placing!
                if (turn === color) (updatePlaceable(), updateStatus("It's your turn!"));
                else updateStatus("Waiting for the opponent's move.");
            } else (updatePlaceable(), updateStatus("Invalid move! Still your turn."));
            
            break;

        case(2):
            console.log("GAME ENDED! Restart game?");

            stopTimer(); // eslint-disable-line
            place(message.position);
            gameOver();
            // TODO  add restart game button to innerHTML game.ejs in gameOver()

            break;

        case(3):
            console.log("GAME ABORTED");

            stopTimer(); // eslint-disable-line
            updateStatus("The other player has left the game :(");

            break;
        
        default:
            console.log("NO KNOWN STATUS RECEIVED BY SERVER");
    }

};

  //server sends a close event only if the game was aborted from some side
socket.onclose = function() {
    console.log("WEBSOCKET CLOSED");
};

socket.onerror = function(event) {
    console.log(event);
};


document.addEventListener("DOMContentLoaded", pageLoaded);

function pageLoaded() {
    console.log("PAGE FULLY LOADED");
    document.querySelector("#board").addEventListener("click", event => {
        mouseClick((/** @type {HTMLElement} */ (event.target)));
    });
}


function setPlayerType() {
    const bg = ["darkbg", "lightbg"];
    const youDIV = document.querySelector("div#you");
    const opponentDIV = document.querySelector("div#opponent");
    youDIV.classList.add(bg[color]);
    opponentDIV.classList.add(bg[color^1]);
}



function updateStatus(str) { 
    statusdiv.style.opacity = "0"; 
    setTimeout(() => {
        statusMessage.innerHTML = str;
        statusdiv.style.opacity = "1";
    }, 500);
}

function mouseClick(/** @type {HTMLElement} */ element) { // the clicked element
    if (gamestatus !== 1) return;
    // could be chip or its child in theory (in practice always child)
    if (!element.classList.contains("chip")) element = element.parentElement;
    if (!element.classList.contains("chip")) return;   // not a chip
                                                    // dataset contains all attributes starting with data-.... (see data-pos in game.ejs)
    const posid = parseInt(element.dataset["pos"]);     // get pos-data from TD (numbers 0, 1, 2, .... 63)

    if (isNaN(posid)) return;
    else {
        // THIS player sends position to be validated by server
        // If its not his turn, gameHandler ignores.
        socket.send(JSON.stringify({position: posid}));          // send OBJECT with Position id propery to server --> connectionHandler calls gameHandler --> verifies
    }       
}


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

const gameOver = () => { // TODO change to "you won" or "you lost" like messages
    console.log("GAME OVER");
    updateStatus(`Winner: ${lightpoints > darkpoints ? "light" : lightpoints === darkpoints ? "tie" : "dark"}`);
    stopped = true;
    // stopTimer();
  // TODO after game has finished, the PLAY AGAIN button must show up (hidden in game.ejs)s
};

// Sends Position (id) to server (moves) --> server sends game update to client B
function place(pos) {
    const toChange = board.place(pos, turn);        // array of Positions sthat hould change color (just placed + flipped)
    if (!toChange.length) return;                   // nothing flipped

    // remove placeable signs
    document.querySelectorAll(".placeable").forEach(el => el.classList.remove("placeable"));

    // Color all positions that have just been flipped (and the 1 placed)
    for (const pos of toChange) 
        setColor(pos);

    // Change score
    const amount = toChange.length;     // score is how much has just changed color
    if (turn) {darkpoints -= (amount-1), lightpoints += (amount); }  // if light had turn, assign light's points and subtract dark's points
    else { lightpoints -= (amount-1), darkpoints += (amount); }
    pointsPlayer.innerHTML = `${darkpoints}`;
    pointsOpponent.innerHTML = `${lightpoints}`;   
}

function updatePlaceable() {
    let placeable = board.canPlace(turn);       // array of Positions that are placeable
    // enable placeables (Position objects)
    for (const pos of placeable)
        setColor(pos);
}

