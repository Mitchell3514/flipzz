// @ts-check
// NO REQUIRES ON THE CLIENT SIDE!

const socket = new WebSocket("ws://localhost:3000");
const board = new Classes.Board(CFG.boardsize, CFG.boardsize);
// position, config and board get imported in game.ejs, BEFORE flipzz

let dark = 2;
let light = 2;
let turn = 0;
let stopped = false;
let waiting = true;     // if waiting is false, eventListener enabled
// TODO Total points per player: update game.ejs innerHTML


// send positions (id) to server (moves) --> server sends game update to client B
// receive from server: JSON.parse + try catch

socket.onopen = function() {
    console.log("CLIENT SENT HELLO TO SERVER...");
    socket.send("Hello from the client");
}

// STATUS 0 Game start: replace "waiting" string by "your turn" + enable eventListener
// STATUS 1 Move invalid: output string
// STATUS 1 Move valid: call place() + next turn
// STATUS 2 Winner: "you won!" + add restart game button to innerHTML game.ejs
// STATUS -1 Game aborted: output string
socket.onmessage = function(event) {
    let message = event.data;
    console.log(message);
    let target = document.querySelector("#time-passed");
    target.innerHTML = message;
}

socket.onclose = function() {
    console.log("WEBSOCKET CLOSED");
    // socket.send(Messages.S_GAME_ABORTED);
}

socket.onerror = function(event) {
    console.log(event);
}

// document.addEventListener("DOMContentLoaded", function(){    
//     if (!window.game) window.game = new Flipzz(); // NOTE Preview code
// });


document.addEventListener("DOMContentLoaded", startGame);

function startGame() {
    console.log("PAGE FULLY LOADED")
}

let clicked = document.querySelector("tbody");  // user can click anywhere on the table
let row = clicked.lastElementChild;
let cell = row.lastElementChild;
let celldiv = cell.lastElementChild;
clicked.addEventListener("click", mouseClick(celldiv));


/** @param {HTMLDivElement} el */
function mouseClick(el) { // the clicked element
    console.log(el);
    if (!el.classList.contains("chip")) return; // not a chip
    // dataset contains all attributes starting with data-.... 
    // see data-pos in game.ejs file
    const posid = parseInt(el.dataset["pos"]); // get pos-data from TD
    // numbers 0, 1, 2, .... 63

    if (isNaN(posid)) return;
    // TODO log pos for now until we have WS set-up 
    // websocket.send(pos)
    else console.log(posid); 

    // NOTE preview code ahead
    let position = new Classes.Position(posid); //TODO ?????????
    place(position);         
}
    

// array of Positions
const initPlace = board.init(Position);  //TODO Parameter should be Position
for (const pos of initPlace) {setColor(pos);}
for (const pos of board.canPlace(turn)) {setColor(pos);}
document.querySelector("#score-dark").innerHTML = `Score dark: ${dark}`;
document.querySelector("#score-light").innerHTML = `Score light: ${light}`;
// dark = 0, light = 1
document.querySelector("p#turn").innerHTML = `Turn: ${turn ? "light" : "dark"}`;


// CSS: adds the colored piece to the board
function setColor(pos) {
    const el = document.querySelector(`[data-pos="${pos.id}"]`);
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
    console.log("done");
    document.querySelector("p#turn").innerHTML = `Winner: ${light > dark ? "light" : light === dark ? "tie" : "dark"}`;
    stopped = true;
}

function switchTurn() {
    turn = +!turn;
    document.querySelector("p#turn").innerHTML = `Turn: ${turn ? "light" : "dark"}`;
}

function place(pos) {
    if (stopped) return

    // Get toflips
    const toChange = board.place(pos, turn);
    if (!toChange.length) return;

    // remove placeable signs
    document.querySelectorAll(".placeable").forEach(el => el.classList.remove("placeable"));

    // Set color
    for (const pos of toChange)
        {setColor(pos);}

    // Change score
    const amt = toChange.length;
    if (turn) {dark -= (amt-1), light += (amt) }
    else { light -= (amt-1), dark += (amt) }
    document.querySelector("#score-dark").innerHTML = `Score dark: ${dark}`;
    document.querySelector("#score-light").innerHTML = `Score light: ${light}`;

    // switch turns
    switchTurn();
    let placeable = board.canPlace(turn);
    if (!placeable.length) {
        switchTurn();
        placeable = board.canPlace(turn);
        if (!placeable.length) return gameOver();
    }

    // enable placeables
    for (const pos of placeable)
        {setColor(pos);}
}

