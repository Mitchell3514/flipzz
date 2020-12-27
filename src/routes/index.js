const express = require('express');
const router = express.Router();
const stats = require("../public/assets/stats.json");

/* GET home page. */
router.get("/", (req, res) => {
	const { games, flipped } = stats; 
	res.render("index", { title: 'Express', connections: connections.length, games, flipped }); // eslint-disable-line
});

/* GET game page */
router.get("/game", (req, res) => {
	res.render("game");
});

module.exports = router;
