const express = require('express');
const router = express.Router();
const stats = require("../public/assets/stats.json");

/* GET home page. */
router.get('/', function(req, res) {
	const { gamesplayed, flipped } = stats;
	res.render('index', { title: 'Express', connections: connections.length, gamesplayed, flipped });
});

module.exports = router;
