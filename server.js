var { url, mongopath } = require("./helper.js");
const express = require("express");
const app = express();
var path = require("path");
var bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(session);
const promisify = require('es6-promisify');
const Course = require("./models/course");
const Page = require("./models/page");
const Location = require("./models/location");

// configure app to use bodyParser()
// this will let us get the data from a POST

//app.use(express.static('./css'));
app.use(express.static("public"));
app.use("/assets", express.static(path.join(__dirname, "node_modules/")));
app.use("/assets", express.static(path.join(__dirname, "assets/css/")));
app.use("/assets", express.static(path.join(__dirname, "assets/icons/")));
app.use("/media", express.static(path.join(__dirname, "assets/media/")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());


app.use(function (req, res, next) {
  //Logger
  console.log(req.method, req.headers.host + req.url);
  next();
});
app.use(function (req, res, next) {
  if (req.query.alert === "created") {
    res.locals.message = "Story created successfully!";
    res.locals.color = "alert-success";
  } else if (req.query.alert === "deleted") {
    res.locals.message = "Story deleted successfully!";
    res.locals.color = "alert-success";
  } else if (req.query.alert === "updated") {
    res.locals.message = "Story updated successfully!";
    res.locals.color = "alert-success";
  } else if (req.query.alert === "success_msg") {
    res.locals.message = "You are registered and can now login!";
    res.locals.color = "alert-success";
  }
  next();
});
var methodOverride = require("method-override");
app.use(methodOverride("_method"));

var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOURL);

// Express Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "notaverysecuresecret",
    key: process.env.SESSION_KEY || "notaverysecurekey",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// pass variables to our templates + all requests
app.use(async (req, res, next) => {
  let courses = await Course.find({})
    .sort("order")
    .exec();
  let locations = await Location.find({})
    .exec();
  let pages = await Page.find({})
    .sort("order")
    .exec();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.locations = locations;
  res.locals.courses = courses;
  res.locals.pages = pages;
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

let indexRoutes = require("./routes/index");
let usersRoutes = require("./routes/users");
let storiesRoutes = require("./routes/stories");
let pagesRoutes = require("./routes/pages");
let eventsRoutes = require("./routes/events");
let coursesRoutes = require("./routes/courses");

let categoryAdminRoutes = require("./routes/admin/categories");
let storiesAdminRoutes = require("./routes/admin/stories");
let pagesAdminRoutes = require("./routes/admin/pages");
let locationsAdminRoutes = require("./routes/admin/locations");
let eventsAdminRoutes = require("./routes/admin/events");
let contactsAdminRoutes = require("./routes/admin/contacts");

app.use("/", indexRoutes);
app.use("/users", usersRoutes);
app.use("/stories", storiesRoutes);
app.use("/pages", pagesRoutes);
app.use("/events", eventsRoutes);
app.use("/courses", coursesRoutes);
app.use("/admin/stories", storiesAdminRoutes);
app.use("/admin/pages", pagesAdminRoutes);
app.use("/admin/locations", locationsAdminRoutes);
app.use("/admin/events", eventsAdminRoutes);
app.use("/admin/categories", categoryAdminRoutes);
app.use("/admin/contacts", contactsAdminRoutes);

app.set("views", path.join(__dirname, "views/"));
app.set("view engine", "pug");

//List of routes printed on server start
function print(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(
      print.bind(null, path.concat(split(layer.route.path)))
    );
  } else if (layer.name === "router" && layer.handle.stack) {
    layer.handle.stack.forEach(
      print.bind(null, path.concat(split(layer.regexp)))
    );
  } else if (layer.method) {
    console.log(
      "%s /%s",
      layer.method.toUpperCase(),
      path
        .concat(split(layer.regexp))
        .filter(Boolean)
        .join("/")
    );
  }
}

function split(thing) {
  if (typeof thing === "string") {
    return thing.split("/");
  } else if (thing.fast_slash) {
    return "";
  } else {
    var match = thing
      .toString()
      .replace("\\/?", "")
      .replace("(?=\\/|$)", "$")
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
    return match
      ? match[1].replace(/\\(.)/g, "$1").split("/")
      : "<complex:" + thing.toString() + ">";
  }
}

console.log("");
console.log("Routes:");
app._router.stack.forEach(print.bind(null, []));
console.log("");

module.exports = app;
