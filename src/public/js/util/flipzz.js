// @ts-check
// NO REQUIRES ON THE CLIENT SIDE!

const clickSound = new Audio("../assets/clicksound.mp3");
const EASTERtoclick = document.querySelector("div#opponent"); // NOTE Easter egg: play against bot ;)
const singleplayer = (new URLSearchParams(document.location.search)).get("single") === "true";


// @ts-ignore For each client, we create a new WebSocket, so each player has its own ws connection with server
const socket = new WebSocket(document.location.origin.replace("http", "ws"));
/** @type {import("./Board").Board} */ // @ts-expect-error
const board = new Classes.Board(CFG.boardsize, CFG.boardsize);
// position, config and board get imported in game.ejs, BEFORE flipzz
let darkpoints = 2;
let lightpoints = 2;
let turn = 0;
let color;                    // 0 is dark, 1 is light
let gamestatus;

/** @type {HTMLDivElement} */
const statusdiv = document.querySelector("div#status");
/** @type {HTMLSpanElement} */
const statusMessage = document.querySelector("p#status-body");
const boardDIV = document.querySelector("div#board");
const pointsYou = document.querySelector("#points-you");
const pointsOpponent = document.querySelector("#points-opponent");
const roomName = document.querySelector("#status-name");
const playAgainButton = document.querySelector("#play-again");


socket.onopen = function() {
    console.log("CLIENT SENT HELLO TO SERVER...");
    const payload = { type: 0, single: singleplayer };
    socket.send(JSON.stringify(payload));             // JSON object: attribute-value pairs
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
            console.log("RECEIVED GAME INFORMATION");
            if (message.name) roomName.innerHTML = `Room name: ${message.name}`;
            else roomName.innerHTML = `Room ID: ${message.gameID}`;
            
            break;

        case(0):
            gamestatus = 1;
            console.log("2 PLAYERS JOINED: GAME START");
            // @ts-ignore
            startTimer(); // eslint-disable-line

            // init board
            for (const pos of board.init()) 
                setColor(pos); // set board to init position

            // parse data
            color = message.player;         // 0 is dark, 1 is light
            setPlayerType();

            // change status
            if (message.turn === color) (updateStatus("It's your turn!"), updatePlaceable());
            else updateStatus("Waiting for the opponent's move.");

            EASTERtoclick.removeEventListener("click", EASTERfunc); // NOTE easter egg code
            break;

        case(1):
            console.log("NEW MOVE VALIDATED BY SERVER");
            // SENT TO BOTH CLIENTS --> { status: 1, valid: true, turn: 0/1  }
                // case 1: This player's move has just been validated, turn switches
                // case 2: Other player's move has just been validated, now it's your turn
            // If INVALID, only sent to THIS client
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
            // @ts-ignore
            stopTimer(); // eslint-disable-line
            place(message.position);
            gameOver(message.winner);
            boardDIV.removeEventListener("click", mouseClick);
            playAgainButton.classList.remove("hidden");             //play again button shows up
            break;

        case(3):
            console.log("GAME ABORTED");
            clearPlaceable(); // @ts-ignore
            stopTimer(); // eslint-disable-line
            updateStatus("The other player has left the game :(");
            boardDIV.removeEventListener("click", mouseClick);
            break;
        
        default:
            console.log("NO KNOWN STATUS RECEIVED BY SERVER");
    }

};

  //server sends a close event only if the game was aborted from some side
socket.onclose = function() {
    console.log("WEBSOCKET CLOSED");

    updateStatus("Disconnected from server, try refreshing the page.");
};

socket.onerror = function(event) {
    console.log(event);
};


document.addEventListener("DOMContentLoaded", pageLoaded);

function pageLoaded() {
    console.log("PAGE FULLY LOADED");
    boardDIV.addEventListener("click", mouseClick);
}


function setPlayerType() {
    const bg = ["darkbg", "lightbg"];
    const youDIV = document.querySelector("div#you");
    const opponentDIV = document.querySelector("div#opponent");
    youDIV.classList.add(bg[color]);                // index 0 is dark, index 1 is light
    opponentDIV.classList.add(bg[color^1]);
}


// by setting a delay, the animation loads
function updateStatus(str) { 
    statusdiv.style.opacity = "0"; 
    setTimeout(() => {
        statusMessage.innerHTML = str;
        statusdiv.style.opacity = "1";
    }, 500);
}

function mouseClick(/** @type {any} */ event) { // the clicked element
    let element = event.target;
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

const gameOver = (winner) => { 
    console.log("GAME OVER");
    if (winner === -1) updateStatus("It's a tie!");
    else updateStatus(winner^color ? "You lost... better luck next time!" : "Congratulations! You won :)");
};


// Sends Position (id) to server (moves) --> server sends game update to client B
function place(pos) {
    const toChange = board.place(pos, turn);        // array of Positions sthat hould change color (just placed + flipped)
    if (!toChange.length) return;                   // nothing flipped

    clickSound.play();
    // remove placeable signs
    clearPlaceable();

    // Color all positions that have just been flipped (and the 1 placed)
    for (const pos of toChange) 
        setColor(pos);

    // Change score
    const amount = toChange.length;     // score is how much has just changed color
    if (turn) {darkpoints -= (amount-1), lightpoints += (amount); }  // if light had turn, assign light's points and subtract dark's points
    else { lightpoints -= (amount-1), darkpoints += (amount); }
    pointsYou.innerHTML = `${color ? lightpoints : darkpoints}`;
    pointsOpponent.innerHTML = `${color ? darkpoints : lightpoints}`;   
}


function clearPlaceable() {
    document.querySelectorAll(".placeable")
        .forEach(el => el.classList.remove("placeable"));
}

function updatePlaceable() {
    let placeable = board.canPlace(turn);       // array of Positions that are placeable
    // enable placeables (Position objects)
    for (const pos of placeable)
        setColor(pos);
}



/* -------------------------------------------------------------------------- */
/*                                  EASTEREGG                                 */
/* -------------------------------------------------------------------------- */
function EASTERfunc() {window.location.href = (window.location.href + "?single=true").replace("??", "?"); }
if (!singleplayer) {
    EASTERtoclick.classList.add("clickable");
    EASTERtoclick.addEventListener("click", EASTERfunc);
}