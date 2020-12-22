const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const RedirectSchema = new Schema({
  from: String,
  to: String
});

module.exports = mongoose.model("Redirect", RedirectSchema);
