const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const LanguageSchema = new Schema({
  title: String
});

module.exports = mongoose.model("Language", LanguageSchema);
