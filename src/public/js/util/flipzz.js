// @ts-check
export default function Flippz(x = bs, y = bs) {
    this.board = new Board(x, y);

    this.dark = 2;
    this.light = 2;

    this.turn = 0;
    this.stopped = false;

    const initPlace = this.board.init();
    for (const pos of initPlace) {setColor(pos);}
    for (const pos of this.board.canPlace(this.turn)) {setColor(pos);}
    document.querySelector("#score-dark").innerHTML = `Score dark: ${this.dark}`;
    document.querySelector("#score-light").innerHTML = `Score light: ${this.light}`;
    document.querySelector("p#turn").innerHTML = `Turn: ${this.turn ? "light" : "dark"}`;

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
        document.querySelector("p#turn").innerHTML = `Winner: ${this.light > this.dark ? "light" : this.light === this.dark ? "tie" : "dark"}`;
        this.stopped = true;
    }

    this.switchTurn = () => {
        this.turn = +!this.turn;
        document.querySelector("p#turn").innerHTML = `Turn: ${this.turn ? "light" : "dark"}`;
    }

    this.place = (pos) => {
        if (this.stopped) return

        // Get toflips
        const toChange = this.board.place(pos, this.turn);
        if (!toChange.length) return;

        // remove placeable signs
        document.querySelectorAll(".placeable").forEach(el => el.classList.remove("placeable"));

        // Set color
        for (const pos of toChange)
            {setColor(pos);}

        // Change score
        const amt = toChange.length;
        if (this.turn) { this.dark -= (amt-1), this.light += (amt) }
        else { this.light -= (amt-1), this.dark += (amt) }
        document.querySelector("#score-dark").innerHTML = `Score dark: ${this.dark}`;
        document.querySelector("#score-light").innerHTML = `Score light: ${this.light}`;

        // switch turns
        this.switchTurn();
        let placeable = this.board.canPlace(this.turn);
        if (!placeable.length) {
            this.switchTurn();
            placeable = this.board.canPlace(this.turn);
            if (!placeable.length) return gameOver();
        }

        // enable placeables
        for (const pos of placeable)
            {setColor(pos);}
    }
};
