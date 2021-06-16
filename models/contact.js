var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ContactSchema = new Schema({
  firstname: String,
  lastname: String,
  locations: [{ type: Schema.ObjectId, ref: "Location" }],
  email: String,
  phone: String,
  track: String,
  body: String,
  jobcenter: String,
  unemployed: String,
  utm_params: Object,
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isCompany: String,
  properties: Object
});

module.exports = mongoose.model("Contact", ContactSchema);
