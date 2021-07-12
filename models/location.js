const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  street: {
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
  isCampus: {
    type: Boolean
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  phone: {
    type: String,
    default: undefined
  },
  email:{
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  avatar: {
    type: String
  },
  order: {
    type: Number,
    default: 99

  },
  contactEmployee: [{
    type: Schema.ObjectId,
    ref: "Employee"
  }]
});

module.exports = mongoose.model("Location", LocationSchema);
