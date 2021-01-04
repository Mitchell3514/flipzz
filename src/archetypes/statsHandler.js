// join makes sure path works in all OS types
const { join } = require("path");
const fs = require("fs");
const PATH = join(ROOT, "../stats.json");
const { inspect: i } = require("util");     //  "import inspect as i from util" met util inspect kan je objecten volledig laten zien als string
const { log } = new (require("./logger"))({ prefix: "[StatsHandler]", color: "\x1b[34m" });

// NOTE intentionally not made for multi threading

let stats = null;
const defaultstats = { games: 0, flipped: 0 };

function createStats() {
    stats = defaultstats;
    return stats;
}

function updateStats(/** @type {Object} */ obj) {
    log(`Updating stats: ${i(obj)}`);
    if (stats === null) getStats();
    Object.keys(obj)
        .forEach(key => {
            typeof stats[key] === "number" ? stats[key] += obj[key] : stats[key] = obj[key];
        });
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

setInterval(() => {
    if (stats === null) getStats();
    fs.writeFile(PATH, JSON.stringify(stats), e => {
        if (e) console.log(e);
        log(`Stats file updated.`);
    });
}, 3e4)

module.exports = {
    getStats,
    updateStats,
}