// @ts-check


/* -------------------------------------------------------------------------- */
/*                    EASTER EGG CODE - NOT TO BE LOOKED AT                   */
/*                    ‼ MIGHT CAUSE SERIOUS EYE IRRITATION                    */
/* -------------------------------------------------------------------------- */



/** @type {import("./Board").Board} */ // @ts-expect-error
const board = new Classes.Board(CFG.boardsize, CFG.boardsize);
// position, config and board get imported in game.ejs, BEFORE flipzz
let darkpoints = 2;
let lightpoints = 2;
let turn = Math.round(Math.random());
const color = Math.round(Math.random());                    // 0 is dark, 1 is light

/** @type {HTMLDivElement} */
const statusdiv = document.querySelector("div#status");
/** @type {HTMLSpanElement} */
const statusMessage = document.querySelector("p#status-body");
const pointsYou = document.querySelector("#points-you");
const pointsOpponent = document.querySelector("#points-opponent");
// const roomName = document.querySelector("#status-name");

document.addEventListener("DOMContentLoaded", pageLoaded);
function pageLoaded() {
    console.log("PAGE FULLY LOADED");
    document.querySelector("#board").addEventListener("click", event => {
        mouseClick((/** @type {HTMLElement} */ (event.target)));
    });
    start();
}

function start() {
    // init board
    for (const pos of board.init()) 
        setColor(pos); // set board to init position
    
    setPlayerType(); // @ts-ignore
    startTimer(); // eslint-disable-line
    
    // change status
    if (turn === color) (updateStatus("It's your turn!"), updatePlaceable());
    else (updateStatus("Let me see..."), botplace());
}

function setPlayerType() {
    const bg = ["darkbg", "lightbg"];
    const youDIV = document.querySelector("div#you");
    const opponentDIV = document.querySelector("div#opponent");
    youDIV.classList.add(bg[color]);
    opponentDIV.classList.add(bg[color^1]);
}

function updateStatus(str) { 
    if (!str) str = ["It's your turn!", "Let me see..."][color^turn];
    statusMessage.innerHTML = str;
}

function mouseClick(/** @type {HTMLElement} */ element) { // the clicked element
    if (turn ^ color) return;

    // could be chip or its child in theory (in practice always child)
    if (!element.classList.contains("chip")) element = element.parentElement;
    if (!element.classList.contains("chip")) return;   // not a chip

    if (!element.classList.contains("placeable")) return;

    const posid = parseInt(element.dataset["pos"]);     // get pos-data from TD (numbers 0, 1, 2, .... 63)
    if (isNaN(posid)) return;

    place(posid); 
}


// Sends Position (id) to server (moves) --> server sends game update to client B
function place(pos) {
    console.log(`placing ${pos}`);
    const canPlace = board.canPlace(turn);
    if (!canPlace.some(position => position.id === pos)) return;

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
    pointsYou.innerHTML = `${color ? lightpoints : darkpoints}`;
    pointsOpponent.innerHTML = `${color ? darkpoints : lightpoints}`;   

    turn = +!turn; // NOTE turn switch
    console.log(`Now ${["dark, light"][turn]}'s turn`);

    if (!board.canPlace(turn).length) return gameOver();

    if (!(turn^color)) updatePlaceable();
    if (turn^color) botplace();
    updateStatus();
}

function botplace() {
    console.log("bot thinking");
    setTimeout(() => {
        const placeable = board.canPlace(+!color);
        const position = placeable[Math.floor(Math.random() & placeable.length)];
        console.log(`Bot placing ${position.id}`);
        place(position.id);
    }, (Math.random() * 1.5 + .5)*1000);
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

function updatePlaceable() {
    let placeable = board.canPlace(turn);       // array of Positions that are placeable
    // enable placeables (Position objects)
    for (const pos of placeable)
        setColor(pos);
}

function gameOver () { 
    console.log("GAME OVER");
    updateStatus(`Winner: ${lightpoints > darkpoints ? "light" : lightpoints === darkpoints ? "tie" : "dark"}`); // @ts-ignore
    stopTimer(); // eslint-disable-line
}


