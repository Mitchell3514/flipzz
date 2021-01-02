(function (exports) {
    function Position(id) {
        this.id = id;
        this.color = null;
        this.setColor = (color) => this.color = color;
        this.isTaken = () => this.color !== null;
    }
    // if client-side: exports = this.Position where this refers to Window, so it becomes a global property (can be accessed by client)
    // if server-side: exports is just module.exports
})(typeof exports === "undefined" ? (this.Classes ? this.Classes : this.Classes = {}) : exports)
// if classes is defined already, use that one

