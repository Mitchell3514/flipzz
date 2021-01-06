// This module is a directory of files (not a single file)

const express = require('express');
const router = express.Router();
const { getStats } = require("../archetypes/statsHandler");
const { current } = require("../archetypes/connectionHandler");	// how many players online, sent to index.ejs

console.log(current);

/* GET home page. */
router.get("/", (req, res) => {
	const { games, flipped } = getStats(); 		// we extract games, flipped from stats.json
	// template + data = rendered HTML view
	// param1: index.ejs file (our HTML template)
	// param2: data for template
	res.render("index", {connections: current, games, flipped }); // eslint-disable-line
});

// prevents caching
router.use("/game", function nocache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
});

/* GET game page after pressing PLAY */
// game.ejs is the HTML template to be rendered
router.get("/game", (req, res) => {
	res.render("game");
});

module.exports = router;
// router is required by app.js