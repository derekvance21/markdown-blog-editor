var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var favicon = require("serve-favicon");
require("dotenv").config();

var client = require("./db");

var blogRouter = require("./routes/blog");
var loginRouter = require("./routes/login");
var apiPostsRouter = require("./routes/api");
var editorRouter = require("./routes/editor");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// lets app know to always authenticate at /editor
// the express.static call is right after, so uses auth before using the static middleware
app.use("/editor", editorRouter);
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "/public/images/favicon.ico")));

// implement user authentication for /editor/
app.use("/blog", blogRouter);
app.use("/login", loginRouter);
app.use("/api/posts", apiPostsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  return next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  if (err.status == 401) {
    const redirect = req.query.redirect || req.body.redirect;
    res.render("login", { redirect });
  } else {
    res.render("error");
  }
});

// connect to Mongo on start
client.connect("mongodb://localhost:27017/", (err) => {
  if (err) {
    console.log("Unable to connect to Mongo.");
    process.exit(1);
  }
});

module.exports = app;
