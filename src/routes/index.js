const express = require('express');
const router = express.Router();
const stats = require("../public/assets/stats.json");

/* GET home page. */
router.get('/', function(req, res) {
	const { games, flipped } = stats;
	res.render('index', { title: 'Express', connections: connections.length, games, flipped });
});

module.exports = router;
