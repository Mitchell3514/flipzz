// @ts-check
// position, config and board get imported in game.ejs

const socket = new WebSocket("ws://localhost:3000");

const board = new Board.Board(CFG.boardsize, CFG.boardsize);

let dark = 2;
let light = 2;
let turn = 0;
let stopped = false;

socket.onmessage = function(event) {
    let message = event.data;
    console.log(message);
    let target = document.querySelector("#time-passed");
    target.innerHTML = message;
}

socket.onopen = function() {
    console.log("Hello from the client");
    socket.send("Hello from the client");
}

socket.onclose = function() {
    console.log("CLOSED");
    socket.send(Messages.S_GAME_ABORTED);
}

socket.onerror = function(event) {
    console.log(event);
}

// document.addEventListener("DOMContentLoaded", function(){
//     // NOTE preview code ahead
//     if (!window.game) window.game = new Flippz(); // NOTE Preview code
// });

// /** @param {HTMLDivElement} el */
// function listener(el) { // the clicked element
//     if (!el.classList.contains("chip")) return; // not a chip
//     // dataset contains all attributes starting with data-.... 
//     // see data-pos in game.ejs file
//     const pos = parseInt(el.dataset["pos"]); // get pos-data from TD
//     // numbers 0, 1, 2, .... 63

//     if (isNaN(pos)) return;
//     // TODO log pos for now until we have WS set-up 
//     // websocket.send(pos)
//     else console.log(pos); 


//     // NOTE preview code ahead
//     game.place(pos);
// }
    

// array of Positions
const initPlace = board.init();
for (const pos of initPlace) {setColor(pos);}
for (const pos of board.canPlace(turn)) {setColor(pos);}
document.querySelector("#score-dark").innerHTML = `Score dark: ${dark}`;
document.querySelector("#score-light").innerHTML = `Score light: ${light}`;
// dark = 0, light = 1
document.querySelector("p#turn").innerHTML = `Turn: ${turn ? "light" : "dark"}`;



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

this.switchTurn = () => {
    turn = +!turn;
    document.querySelector("p#turn").innerHTML = `Turn: ${turn ? "light" : "dark"}`;
}

this.place = (pos) => {
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

