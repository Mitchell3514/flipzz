// @ts-check
import Flippz from "./util/flipzz.js";
import "./util/config.js"


// eventlisteners
const board = document.querySelector("table"); // get board element 
if (!board) throw new Error("Couldn't find board");

/** @ts-ignore */
// event fired, event.target is the element that's clicked on
board.addEventListener("click", event => listener(event.target)); // add listener to board

/** @param {HTMLDivElement} el */
function listener(el) { // the clicked element
    if (!el.classList.contains("chip")) return; // not a chip
    // dataset contains all attributes starting with data-.... 
    // see data-pos in game.ejs file
    const pos = parseInt(el.dataset["pos"]); // get pos-data from TD
    // numbers 0, 1, 2, .... 63

    if (isNaN(pos)) return;
    // TODO log pos for now until we have WS set-up 
    // websocket.send(pos)
    else console.log(pos); 

}
