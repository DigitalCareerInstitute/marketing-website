require("dotenv").config({ path: __dirname + "/../.env" });
const request = require("request");
const Event = require("../models/event");
const Location = require("../models/location");
const fetchEventsByLocation = require("../helpers/fetch_events_by_location");

module.exports.getEvents = async (req, res) => {
  const eventsByLocation = await fetchEventsByLocation(true);
  res.render("events", {
    eventsByLocation
  });
};

module.exports.getEventsByLocation = async (req, res) => {
  let location = await Location.findOne({
    name: { $regex: new RegExp(req.params.location, "i") }
  });

  if (location) {
    let events = await Event.find({
      location: location._id,
      start: { $gt: new Date() }
    });
    res.render("eventsByLocation", {
      events,
      location
    });
  } else {
    res.redirect("/events");
  }
};
