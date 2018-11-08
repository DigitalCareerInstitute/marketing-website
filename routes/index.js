"use strict";
require("dotenv").config({ path: __dirname + "/../.env" });
const Story = require("../models/story");
const Contact = require("../models/contact");
const Category = require("../models/category");
const Location = require("../models/location");
const Course = require("../models/course");
const Event = require("../models/event");

const express = require("express");
const router = express.Router();

const nodemailer = require("nodemailer");

router.get("/", async (req, res) => {
  try {
    const stories = await Story.find({})
      .populate("categories")
      .sort("order")
      .exec({});
    const locations = await Location.find({})

    let courses = await Course.find({})
    let events = []
    for await (let loc of locations){
      if(!events){
        events[await Event.findOne({ location: loc._id }).populate("location")]
      } else {
        events.push(await Event.findOne({ location: loc._id }).populate("location"))
      }
    }

    res.render("index", {
      events,
      stories,
      locations,
      courses
    });
  } catch (err) {
    console.log(err);
  }
});


router.post('/contact', async (req, res) => {
  var contact = new Contact(); 

  contact.name = req.body.name;
  contact.email = req.body.email;
  contact.body = req.body.body;
  contact.createdAt = new Date();

  contact.locations = req.body.locations;
  if (!contact.email) {
    res.redirect("/?alert=error")
  }

  contact.save(function (err) {
    if (err) res.send(err);
    console.log("Contact created:", contact);

    let transporter = nodemailer.createTransport({
      host: process.env.MAILHOST,
      port: process.env.MAILPORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPW
      }
    });

    let mailOptions = {
      from: contact.name,
      to: process.env.MAILRECEIVER,
      subject: `Message from ${contact.name}`,
      text: `${contact.body}`,
      html: `${contact.body}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
        res.redirect("/?alert=error");
      }
      console.log('#####', info);
      console.log("Message sent: %s", info.messageId);
    });

    res.redirect("/?alert=success");
  });
});
module.exports = router;
