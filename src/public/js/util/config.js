// Code shared between client and server: game setup.
(function(exports) {
    exports.boardsize = 8;
    exports.ADDRESS = "localhost";
    exports.PORT = 3000;
})(typeof exports === "undefined" ? (this.CFG = {})  : exports);
