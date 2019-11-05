"use strict";
require("dotenv").config({
  path: __dirname + "/.env"
});
const fs = require("fs");
const path = require("path");

const Story = require("./models/story");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
mongoose.Promise = global.Promise;
(async () => {
  try {
    const storiesToRename = await Story.find({ "subtitle": { $exists: true } })
    if (storiesToRename.length === 0) {
      await mongoose.connection.collection('stories').updateMany({ "title": { $exists: true } }, { $rename: { "title": "subtitle" } }, false);
      await mongoose.connection.collection('stories').updateMany({ "alumniName": { $exists: true } }, { $rename: { "alumniName": "title" } }, false);
      console.log("Migration successful");
    } else {
      console.log("No matching records");
    }
  } catch (error) {
    console.log('error', error);
  }
})()
