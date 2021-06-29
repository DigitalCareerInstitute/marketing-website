"use strict";
require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const router = express.Router();
const IndexController = require("../controllers/IndexController");

if (process.env.NODE_ENV !== "test" && (!process.env.AUTHORIZATION || !process.env.URL)) {
  console.error(
    "Please set a Mailchimp URL or AUTHORIZATION ApiKey in .env file"
  );
  process.exit();
}

router.get("/", IndexController.landingpage);

router.get("/contact", IndexController.contactLocations);

router.post("/contact", IndexController.contact);

router.post("/downloadcurriculum", IndexController.downloadCourseCurriculum);

router.get("/tour", IndexController.tour);

router.post("/newsletter-signup", IndexController.newsletter);

router.get("/jobcenter", IndexController.jobcenter);

router.get("/thank-you/:id", IndexController.thankYou);

router.get("/signup", IndexController.signupCourse);

router.get("/robots.txt", function (req, res) {
  res.type("text/plain");
  res.send("User-agent: *");
});

module.exports = router;
