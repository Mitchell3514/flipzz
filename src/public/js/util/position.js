(function (exports) {
    exports.Position = function Position(id) {
        this.id = id;
    
        this.color = null;
        this.setColor = (color) => this.color = color;
        this.isTaken = () => this.color !== null;
    }
    // if client-side: exports = this.Position where this refers to Window
    // if server-side: exports is just module.exports
})(typeof exports === "undefined" ? (this.Position = {}) : exports)
