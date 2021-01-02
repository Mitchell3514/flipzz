// This module is a directory of files (not a single file)

const express = require('express');
const router = express.Router();
const stats = require("../public/assets/stats.json");
const {current} = require("../archetypes/connectionHandler");		// current is the name of the exported module

/* GET home page. */
router.get("/", (req, res) => {
	const { games, flipped } = stats; 
	// parameters sent to server (to render) from stats.json
	// param1: index.ejs file (our template)
	// param2: data for template
	// connections is global array in app.js
	res.render("index", {connections: current, games, flipped }); // eslint-disable-line
});

/* GET game page after pressing PLAY */
router.get("/game", (req, res) => {
	res.render("game");
});

module.exports = router;