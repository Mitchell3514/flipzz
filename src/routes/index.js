const express = require('express');
const router = express.Router();

const { readFileSync } = require("fs");
/* GET home page. */
router.get('/', function(req, res) {
	readFileSync("../public/assets/stats").then(res => {
		const { gamesplayed, flipped } = JSON.parse(res);
		res.render('index', { title: 'Express', connections: connections.length, gamesplayed, flipped });
	});
});

module.exports = router;
