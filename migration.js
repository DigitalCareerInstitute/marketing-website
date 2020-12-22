"use strict";
require("dotenv").config({
  path: __dirname + "/.env"
});
const fs = require("fs");
const path = require("path");

const Employee = require("./models/employee");
const Partner = require("./models/partner");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
mongoose.Promise = global.Promise;
(async () => {
  try {
    const res = await Partner.find({})
    await Promise.all(res.map(async res => await res.save()))
    console.log("Migration successful");
  } catch (error) {
    console.log('error', error);
  }
})()
