// join makes sure path works in all OS types
const { join } = require("path");
const fs = require("fs");               // filesystem
const PATH = join(ROOT, "../stats.json");
const { inspect: i } = require("util");     // (Node module) "import inspect as i from util" met util inspect kan je objecten volledig laten zien als string
const { log } = new (require("./logger"))({ prefix: "[StatsHandler]", color: "\x1b[34m" }); // extract this.log from logger.js

// NOTE intentionally not made for multi threading

let stats = null;
let change = false;
const defaultstats = { games: 0, flipped: 0 };

function createStats() {        // updates stats
    stats = defaultstats;
    return stats;
}

function updateStats(/** @type {Object} */ obj) {
    log(`Updating stats: ${i(obj)}`);
    Object.keys(obj)
        .forEach(key => 
            (typeof stats[key] === "number" ? stats[key] += obj[key] : stats[key] = obj[key])
            && (change = true)
        );
}

function getStats() {
    try {
        if (stats === null) {
            log("Retrieving stats...");
            stats = require(PATH)
        };
    } catch(e) {
        log("Failed retrieving, now creating stats...")
        stats = createStats();
    } finally{
        return stats;
    }
}

function writeStats() {
    if (stats === null) getStats();
    fs.writeFile(PATH, JSON.stringify(stats), e => {       // stats.json file gets overwritten
        if (e) console.log(e);
        log(`Stats file updated.`);
    });
}

// setInterval(() => change ??= (writeStats(), false), 5e3) NOTE ES2021 syntax to re-enable later
setInterval(() => { if (change) change = (writeStats(), false) }, 5e3)
writeStats();

module.exports = {
    getStats,
    updateStats,
}