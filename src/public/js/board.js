// @ts-check
import Position from "./position.js";

export default function Board(x, y) {
    this.board = [];

    y ??= x; // FIXME[epic=prod] remove this in production
    this.x = x;
    this.y = y;
    this.size = x * y;

    this._dirs = {
        N: -this.x,
        NE: -(this.x-1),
        E: +1,
        SE: +(this.x+1),
        S: +this.x,
        SW: +(this.x-1),
        W: -1,
        NW: -(this.x+1),
    };
    Object.freeze(this._dirs);

    this.dirs = Object.keys(this._dirs);
    
    // public functions
    this.init = () => {
        // initialize board
        for (const i in " ".repeat(this.x*this.y).split(" "))
            this.board.push(new Position(Number(i)));
                
        // fill first 4
        const 
            topLeft = (this.x/2-1)*this.x + this.x/2-1,
            topRight = (this.x/2-1)*this.x + this.x/2,
            bottomLeft = (this.x/2)*this.x + this.x/2-1,
            bottomRight = (this.x/2)*this.x + this.x/2;

        this._getAt(topLeft).setColor(0);
        this._getAt(topRight).setColor(1);
        this._getAt(bottomLeft).setColor(0);
        this._getAt(bottomRight).setColor(1);
    }

    this.place = (pos, color) => {
        const toFlips = this._getFlips(pos, color); // Position[]

        if (!toFlips.length) return false; // nothing to flip -> can't place so return false
        
        for (const toFlip of toFlips)
            toFlip.setColor(+!color); // flip all the positions
        
        return toFlips.length; // return how many Positions we flipped
    };

    // 'private' functions
    this._getAt = (pos, dir) => {
        let id;
        if (typeof pos === "number") id = pos;
        else id = pos.id;
        
        const newid = id + (dir ? this._dirs[dir] : 0);

        if (newid >= 0 && newid < this.size) return this.board[newid];
        else return null;
    };

    this._getFlips = (pos, color) => {
        if (pos.isTaken()) return []; // can't this.place if it's already taken.

        const toFlips = []; // store which directions are valid.

        for (const dir of this.dirs) { // for every direction
            let newPos = this._getAt(pos, dir); // first move in that direction.
            
            if (!newPos) return; // if the pos isn't on the board.
            if (pos.color !== +!color) break; // check if the new position is of the opponent, otherwise it's invalid.

            const toFlip = []; // store which positions we go over (will be flipped if valid).

            while (newPos.color === +!color) { // do this for as long as the new position is the opponent's.
                toFlip.push(newPos); // add the current position to the ones that'll be flipped.
                newPos = this._getAt(newPos, dir); // move position in direction again.

                if (!newPos) break; // position outside the board? stop the loop (getColor would break)
            }

            if (newPos && newPos.color === color) toFlips.push(...toFlip); // if the line ends with your colour, add to toflips for this position.
        }

        return toFlips; // return the amount flipped when placed at pos by color
    };
}