// @ts-ignore
global.ROOT = __dirname;

// @ts-check
const http = require("http");
const createError = require("http-errors");
const express = require("express");				// express: this node.js framework sends HTTP responses for us 
const { join } = require("path");
const logger = require("morgan");
const websocket = require("ws");
const { createHash } = require("crypto");

// routers
const indexRouter = require('./routes/index');
const { ConnectionHandler } = require("./archetypes/connectionHandler");
const connectionHandler = new ConnectionHandler();

const app = express();

// set express' static file path to send HTTP responses  (path.join works in all OS types)
// uses this for EVERY request (GET, POST, PUT...)
// Express will always look for routes/index 
app.use(express.static(join(__dirname, "/public")));

// view engine setup: views directory containing all EJS templates
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger("dev"));

// log ip hash (just in to be sure)
app.use("/", (req, res, next) => {
	const date = new Date();
	const iphash = createHash("md5").update(req.ip).digest("hex");
	console.log(`${date.getHours()}:${date.getMinutes()}:${date.getMinutes()} - ${iphash}`);
	next();
});

app.use('/', indexRouter);		// route handler (middleware) --> routes/index

// catch 404 and forward to error handler (middleware)
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler (middleware)
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
	next();
});

const port = parseInt(process.argv[2] ?? process.env.PORT ?? 3000);
if (isNaN(port)) throw new TypeError("Port is not of type number");

let server;
try {
	server = http.createServer(app).listen(port);
} catch (e) { console.log(e); process.exit(1); }
console.log(`Server started on http(s)://${server.address()?.address?.replace("::", "localhost")}:${server.address()?.port}`);

const wss = new websocket.Server({ server });

wss.on("connection", function connection(ws) {
	// @ts-expect-error
	connectionHandler.handle(ws);
});

function end() {
	console.log("Received stopcode");
	if (server.listening) {
		console.log("Shutting down server");
		server.close((err) => err ? process.exit(1) : null);
		process.exit(0);
	}
}
process.on('SIGINT', end);
process.on('SIGTERM', end);
