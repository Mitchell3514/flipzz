(function (exports) {
    function Position(id) {
        this.id = id;
    
        this.color = null;
        this.setColor = (color) => this.color = color;
        this.isTaken = () => this.color !== null;
    }
})(typeof exports === "undefined" ? (this.Position = {}) : exports)