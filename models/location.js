var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
  name: {
    type: String,
    //TODO fetching events and jobs just rely on this fixed locations. If DCI creates another location, this must be allowed here
    enum: ["Berlin", "Hamburg", "Leipzig", "Düsseldorf"],
    required: true,
    unique: true
  },
  street: {
    type: String
  },
  email: {
    type: String
  },
  zip: {
    type: String
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  phone: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Location", LocationSchema);
