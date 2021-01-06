const { log, error } = new (require("./logger"))({ prefix: "[RandomName]", color: "\x1b[34m" });

const https = require("https");
const names = [];
async function getName() {
    if (!process.env.APITOKEN) throw new Error("Need a token.");
    if (!names.length) await fetchNames();
    return names.splice(0, 1)[0] ?? "none";
}

let stop = false;
let page = 0;
function fetchNames() {         // give each game a random name (retrieved from API)
    return new Promise((resolve, reject) => {
        if (stop) reject();
        log(`Fetching random names.`);
        https.get({
            host: "the-one-api.dev",
            path: "/v2/character?limit=50",
            headers: {
                Authorization: `Bearer ${process.env.APITOKEN}`
            }
        })
        .on("response", (response) => {
            let str = "";
            response.on("data", data => str += data);
            response.once("end", () => {
                try {
                    // parse payload and check if correct
                    const payload = JSON.parse(str);
                    if (payload.success === false) { stop = true; throw new Error(payload) };
                    if (!payload.docs?.length) throw new Error(payload); // shouldn't happen

                    // advance page if possible
                    page < payload.pages ? page++ : page = 0;

                    // shuffle first names and put in the names array
                    names.push(...shuffle(payload.docs.map(doc => doc.name)));
                    resolve();
                } catch (e) { error(`Unable to resolve random names.\n${e}`); reject(e); }
            });
            response.once("close", () => { if (!names.length) { error(`Unable to fetch random names.`); reject(); } });
        });
    });
}

/**
 * Shuffle code taken from SO and modified a bit
 * @source https://stackoverflow.com/a/2450976/5909894
 * @param {any[]} array
 * @returns {any[]}
 */
function shuffle(array) {
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

module.exports = { getName }