// @ts-check

// parameters given to module below...
(function (exports, Position) {
    function Board(x, y) {
        this.board = [];
    
        if (!y) y = x;
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
            for (let i = 0; i < this.x*this.y; i++)
                this.board.push(new Position(Number(i)));
                    
            // fill first 4
            const toFills = [
                this._getAt((this.x/2-1)*this.x + this.x/2-1), // NW
                this._getAt((this.x/2-1)*this.x + this.x/2), // NE
                this._getAt((this.x/2)*this.x + this.x/2-1), // SW
                this._getAt((this.x/2)*this.x + this.x/2) // SE
            ];
    
            let d = 1;
            for (const toFill in toFills)
                toFills[toFill].setColor(+[0,3].includes(Number(toFill)))   // method in Position.js
    
            return toFills;         // array of Positions
        }
    
        this.canPlace = (color) => {
            const positions = [];
            for (let i = 0; i < this.x * this.y; i++) {
                const pos = this._getAt(i);
                const toFlips = this._getFlips(pos, color);     // array of Positions flipped when placed at pos by color
                if (toFlips.length) positions.push(pos);
            }
            return positions;           // array of ALL Positions where can be placed (in the whole board)
        }; 

        // if dark won: 0 returned
        // if light won: 1 returned
        this.winner = () => {
            let light = 0;
            let dark = 0;
            for (const pos of this.board)
                pos.color === 0 ? dark++ : pos.color === 1 ? light++ : null;
            return +(light > dark);
        }
        
        // pos: Position object
        // color: 0 = dark, 1 = light
        this.place = (pos, color) => {
            if (typeof pos === "number") pos = this._getAt(pos);
            const toFlips = this._getFlips(pos, color); // Position[] --> array of Position objects 
    
            if (!toFlips.length) return []; // nothing to flip -> can't place so return false
            
            for (const toFlip of toFlips)
                toFlip.setColor(color); // flip/color all the Positions (that can be flipped)
            pos.setColor(color);        // also color the Pos where has been placed
            
            toFlips.push(pos);
            return toFlips; // return array of Positions where color has changed
        };
    
        // 'private' functions
        this._getAt = (pos, dir) => {       // returns fist Position in a certain direction
            let id;
            if (typeof pos === "number") id = pos;
            else id = pos.id;
            
            if (id % 8 === 0 && dir === "W") return null;
            if ((id+1) % 8 === 0 && dir === "E") return null;
            const newid = id + (dir ? this._dirs[dir] : 0);
    
            if (newid >= 0 && newid < this.size) return this.board[newid];
            else return null;
        };
    
        this._getFlips = (pos, color) => {
            if (pos.isTaken()) return []; // can't this.place if it's already taken.
    
            const toFlips = []; // store which directions are valid.
    
            for (const dir of this.dirs) { // for every direction
                let newPos = this._getAt(pos, dir); // first move in that direction.
    
                if (!newPos) continue; // if the pos isn't on the board.
                if (newPos.color === null || newPos.color !== +!color) continue; // check if the new position is of the opponent, otherwise it's invalid.
    
                const toFlip = []; // store which positions we go over (will be flipped if valid).
    
                while (newPos && newPos.color === +!color) { // do this for as long as the new position is the opponent's.
                    toFlip.push(newPos); // add the current position to the ones that'll be flipped.
                    newPos = this._getAt(newPos, dir); // move position in direction again.
                }
    
                if (newPos && newPos.color === color) toFlips.push(...toFlip); // if the line ends with your colour, add to toflips for this position.
            }
    
            return toFlips; // return array of Positions flipped when placed at pos by color
        };
    }
    exports.Board = Board;
    // this refers to Window
})(typeof exports === "undefined" ? 
        this.Classes || (this.Classes = {}) 
        : exports
    , typeof exports === "undefined" ?
        Classes.Position 
        : require("./position").Position);
// param exports: if client, we give property Classes to window (if already defined, use that one)
// param Position: if client, we use Position already assigned to Classes, if server, we require Position (object of the module!)