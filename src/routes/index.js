const Router = require("express").Router;

const router = new Router();

/* GET home page. */
router.get("/", (req, res) => {
	// parameters sent to server (to render) from stats.json.
	res.render("index", { }); // eslint-disable-line
});

/* GET game page after pressing PLAY */
router.get("/game", (req, res) => {
	res.render("game");
});

module.exports = router;