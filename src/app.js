// @ts-ignore
global.ROOT = __dirname;

// @ts-check
const http = require("http");
const createError = require('http-errors');
const express = require('express');
const { join } = require('path');
const logger = require('morgan');
const websocket = require('ws');

// routers
const indexRouter = require('./routes/index');
const { ConnectionHandler } = require("./archetypes/connectionHandler");
const connectionHandler = new ConnectionHandler();

const app = express();

// set express' static file path  (path.join works in all OS types)
// uses this for EVERY request (GET, POST, PUT...)
app.use(express.static(join(__dirname, "/public")));

// view engine setup: views directory contains all templates
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger("dev"));
app.use('/', indexRouter);		// route handler (middleware)

// catch 404 and forward to error handler (middleware)
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
	next();
});

const port = process.argv[2] ?? process.env.PORT ?? 3000;
const server = http.createServer(app).listen(port); // @ts-expect-error
console.log(`Server started on http(s)://${server.address().address.replace("::", "localhost")}:${server.address().port}`);

const wss = new websocket.Server({ server });

wss.on("connection", function connection(ws) {
	// @ts-expect-error
	connectionHandler.handle(ws);
});

