var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  model: Object,
});

module.exports = mongoose.model("Question", QuestionSchema);
