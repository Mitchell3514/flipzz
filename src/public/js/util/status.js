(function(exports) {

    let status = {
        "-1": "NOT ALLOWED",
        "0": "OK"
    };
    for (const key in status)
        status[status[key]] = key;
    exports.status = status;

})(typeof exports === "undefined" ? (this.CFG = {}) : exports)