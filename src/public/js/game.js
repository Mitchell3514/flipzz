// @ts-check
import Flippz from "./util/flipzz.js";
import "./util/config.js"


// eventlisteners

const board = document.querySelector("#board")[0];
if (!board) throw new Error("Couldn't find board");

board.on("click", el => {
    el = el.srcElement;
    const td = el.tagName === "IMG" ? el.parent : el;
    const id = el.
});