// @ts-check
import Board from "./board.js";
import CFG from "./config.js";
const { boardsize: bs } = CFG;

export default function Flippz(x = bs, y = bs) {
    this.board = new Board(x, y);

    this.black = 2;
    this.white = 2;

    
};
