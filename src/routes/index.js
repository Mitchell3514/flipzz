// This module is a directory of files (not a single file)

const express = require('express');
const router = express.Router();
const stats = require("../public/assets/stats.json");				// JSON files don't have to be exported like JS files
const { current } = require("../archetypes/connectionHandler");

console.log(current);

/* GET home page. */
router.get("/", (req, res) => {
	const { games, flipped } = stats; 		// we extract games, flipped from stats.json
	// template + data = rendered HTML view
	// param1: index.ejs file (our HTML template)
	// param2: data for template
	res.render("index", {connections: current, games, flipped }); // eslint-disable-line
});

/* GET game page after pressing PLAY */
// game.ejs is the HTML template to be rendered
router.get("/game", (req, res) => {
	res.render("game");
});

module.exports = router;
// router is required by app.js