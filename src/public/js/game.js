// @ts-check
import Flippz from "./util/flipzz.js";
import "./util/config.js"


// eventlisteners
const board = document.querySelector("table"); // get board element 
if (!board) throw new Error("Couldn't find board");

/** @ts-ignore */
board.addEventListener("click", el => listener(el.target)); // add listener to board

/** @param {HTMLDivElement} el */
function listener(el) { // the clicked element
    if (el.tagName !== "DIV") return; // not a chip
    const pos = parseInt(el.dataset["pos"]); // get pos data from TD

    if (isNaN(pos)) return;
    else console.log(pos); // log pos for now until we have WS set-up 

    const CL = document.querySelector("#right").classList;
    if (CL.contains("hidden")) CL.remove("hidden");
    else CL.add("hidden");
}
