module.exports = class Flippz {
    board = [];

    X;
    Y;
    size;

    dirs;
    
    constructor(x, y) {
        // Assign sizes
        this.X = x;
        this.Y = y;
        this.size = this.X * this.Y;

        this.dirs = {
            N: -this.size,
            NE: -(this.size-1),
            E: +1,
            SE: +(this.size+1),
            S: +this.size,
            SW: +(this.size-1),
            W: -1,
            NW: -(this.size+1),
        }

        for (const i in " ".repeat(x*y).split(""))
            this.board.push("x");
        
        start();
    }

    getColor(pos) { return this.board[pos]; }
    istaken(pos) { return this.board[pos] !== "x"; }
    place(pos, color) { this.board[pos] = color; }
    valPos(pos) { return pos >= 0 && pos < size }
    winner() { 
        const c = {b: 0, w: 0}
        for (const p of this.board) { if (p === 0) c.b++; else if (p === 1) c.w++; }
        return c.b === c.w ? -1 : +(c.b > c.w)^1;
    }

    // Checks if a color can place on a certain position
    validate(pos, color) {
        if (istaken(pos)) return false; // can't place if it's already taken

        const toFlips = []; // store which directions are valid

        Object.keys(this.dirs).forEach(dir => { // check every direction
            let newPos = move(pos, dir); // first move in that direction

            if (!valPos(newPos)) return; // check if the new position is even on the board.
            if (getColor(newPos) !== +!color) return; // check if the new position is of the opponent, otherwise it's invalid.

            const toFlip = []; // store which positions we go over (will be flipped if valid).

            while (getColor(newPos) === +!color) { // do this for as long as the new position is the opponent's
                toFlip.push(newPos); // add the current position to the ones that'll be flipped
                newPos = move(newPos, dir); // move position in direction again
                if (!valPos(newPos)) break; // position outside the board? stop the loop (getColor would break)
            }

            if (getColor(newPos) === color) toFlips.push(toFlip); // if the line ends with your colour, add to toflips for this position.
        });

        if (!toFlips.length) return false; // if there are no valid directions: false
        else return toFlips; // else you can place here
    }

    start() {
        const 
        topLeft = (size/2-1)*size + size/2-1,
        topRight = (size/2-1)*size + size/2,
        bottomLeft = (size/2)*size + size/2-1,
        bottomRight = (size/2)*size + size/2;

        place(topLeft, 1);
        place(topRight, 0);
        place(bottomLeft, 0);
        place(bottomRight, 1);
    }
};
