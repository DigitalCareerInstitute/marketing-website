require('dotenv').config({ path: __dirname + '/../.env' });
const request = require("request");
const Event = require('../models/event');
const Location = require('../models/location');

module.exports.getEvents = async (req, res) => {
  let events = await Event.find().populate("location")

  locationEvents = events.reduce(function (acc, obj) {
    if (obj.location) {
      if (!acc[obj.location.name]) {
        acc[obj.location.name] = [];
      }
      acc[obj.location.name].push(obj);
      return acc;
    } else {
      return acc
    }
    }, {});

  res.render('events', {
    locationEvents
  })
}
module.exports.getEventsByLocation = async (req, res) => {
  let location = await Location.findOne( { "name" : { $regex : new RegExp(req.params.location, "i") } } ) 

  let events = await Event.find({location: location._id})

  res.render('eventslocation', {
    events
  })
}

