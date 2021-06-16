const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  answers: Object
});
module.exports = mongoose.model("Answer", AnswerSchema);
